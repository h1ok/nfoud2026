import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const RESERVED_CATEGORY_KEYS = new Set(['id', 'editor_id', 'created_at']);

function extractCategoryValue(row: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(row)) {
    if (RESERVED_CATEGORY_KEYS.has(key)) continue;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim().toLowerCase();
    }
  }
  return null;
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from('editors')
    .select('id, name, position')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Admin editors GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch editors' }, { status: 500 });
  }

  const editors = data ?? [];

  const categoriesByEditor = new Map<string, string[]>();
  const { data: mappings, error: mappingError } = await supabaseServer
    .from('editor_categories')
    .select('*');

  if (mappingError) {
    console.error('Admin editor_categories GET failed:', mappingError);
  } else if (mappings) {
    for (const row of mappings as Record<string, unknown>[]) {
      const editorId = typeof row.editor_id === 'string' ? row.editor_id : null;
      const category = extractCategoryValue(row);
      if (!editorId || !category) continue;

      const existing = categoriesByEditor.get(editorId) ?? [];
      if (!existing.includes(category)) existing.push(category);
      categoriesByEditor.set(editorId, existing);
    }
  }

  const items = editors.map((editor) => ({
    ...editor,
    categories: categoriesByEditor.get(editor.id) ?? [],
  }));

  return NextResponse.json({ items });
}

async function getAllowedCategories(): Promise<Set<string>> {
  const fallback = new Set(['politics', 'economy', 'local', 'sports']);
  try {
    const { data, error } = await supabaseServer.from('categories').select('slug');
    if (!error && data && data.length > 0) {
      return new Set(data.map((row: { slug: string }) => row.slug));
    }
  } catch (err) {
    console.error('getAllowedCategories failed, using defaults:', err);
  }
  return fallback;
}

async function normalizeCategories(input: unknown): Promise<string[]> {
  if (!Array.isArray(input)) return [];
  const allowed = await getAllowedCategories();
  const cleaned = input
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => allowed.has(value));
  return Array.from(new Set(cleaned));
}

async function syncCategories(editorId: string, categories: string[]) {
  await supabaseServer.from('editor_categories').delete().eq('editor_id', editorId);
  if (categories.length > 0) {
    const rows = categories.map((category) => ({ editor_id: editorId, category }));
    const { error } = await supabaseServer.from('editor_categories').insert(rows);
    if (error) throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const position = typeof body.position === 'string' ? body.position.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    const categories = await normalizeCategories(body.categories);

    if (!name) {
      return NextResponse.json({ error: 'اسم الكاتب مطلوب' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('editors')
      .insert([{ name, position: position || null, bio: bio || null }])
      .select('id, name, position, bio')
      .single();

    if (error || !data) {
      console.error('Admin editors POST failed:', error);
      return NextResponse.json({ error: 'فشل إضافة الكاتب' }, { status: 500 });
    }

    await syncCategories(data.id, categories);

    return NextResponse.json({ item: { ...data, categories } }, { status: 201 });
  } catch (error) {
    console.error('Admin editors POST crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'معرّف الكاتب مطلوب' }, { status: 400 });
    }

    const updates: Record<string, string | null> = {};
    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: 'اسم الكاتب مطلوب' }, { status: 400 });
      updates.name = name;
    }
    if (typeof body.position === 'string') updates.position = body.position.trim() || null;
    if (typeof body.bio === 'string') updates.bio = body.bio.trim() || null;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseServer.from('editors').update(updates).eq('id', id);
      if (error) {
        console.error('Admin editors PATCH failed:', error);
        return NextResponse.json({ error: 'فشل تحديث الكاتب' }, { status: 500 });
      }
    }

    let categories: string[] | undefined;
    if (body.categories !== undefined) {
      categories = await normalizeCategories(body.categories);
      await syncCategories(id, categories);
    }

    const { data } = await supabaseServer
      .from('editors')
      .select('id, name, position, bio')
      .eq('id', id)
      .single();

    return NextResponse.json({ item: { ...data, ...(categories !== undefined ? { categories } : {}) } });
  } catch (error) {
    console.error('Admin editors PATCH crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'معرّف الكاتب مطلوب' }, { status: 400 });
    }

    await supabaseServer.from('editor_categories').delete().eq('editor_id', id);
    const { error } = await supabaseServer.from('editors').delete().eq('id', id);

    if (error) {
      console.error('Admin editors DELETE failed:', error);
      return NextResponse.json({ error: 'فشل حذف الكاتب. تأكد من عدم ارتباطه بأخبار.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin editors DELETE crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}
