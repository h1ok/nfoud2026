import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { DEFAULT_CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

// Postgres error code when a relation (table) does not exist.
const UNDEFINED_TABLE = '42P01';

const RESERVED_SLUGS = new Set(['live', 'about', 'contact', 'authors', 'article', 'all-news', 'auth', 'api', 'category', 'dashboard-control-panel-2025']);

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from('categories')
    .select('id, slug, name, description, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    if (error.code === UNDEFINED_TABLE) {
      console.warn('categories table missing; returning defaults');
      return NextResponse.json({
        items: DEFAULT_CATEGORIES.map((c) => ({
          id: c.slug,
          slug: c.slug,
          name: c.name,
          description: null,
          sort_order: c.sort_order ?? 0,
        })),
        warning: 'جدول categories غير موجود في قاعدة البيانات. شغّل ملف categories-setup.sql في Supabase لتفعيل الإضافة والتعديل والحذف.',
      });
    }

    console.error('Admin categories GET failed:', error);
    return NextResponse.json({ error: 'فشل جلب التصنيفات' }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const providedSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const slug = slugify(providedSlug || name);
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

    if (!name) {
      return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: 'المعرّف (slug) غير صالح' }, { status: 400 });
    }
    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({ error: 'هذا المعرّف محجوز، اختر معرّفاً آخر' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('categories')
      .insert([{ slug, name, description: description || null, sort_order: sortOrder }])
      .select('id, slug, name, description, sort_order')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'يوجد تصنيف بنفس المعرّف بالفعل' }, { status: 409 });
      }
      console.error('Admin categories POST failed:', error);
      return NextResponse.json({ error: 'فشل إضافة التصنيف' }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Admin categories POST crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'معرّف التصنيف مطلوب' }, { status: 400 });
    }

    const updates: Record<string, string | number | null> = {};
    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 });
      updates.name = name;
    }
    if (typeof body.description === 'string') updates.description = body.description.trim() || null;
    if (body.sort_order !== undefined && Number.isFinite(Number(body.sort_order))) {
      updates.sort_order = Number(body.sort_order);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'لا توجد تغييرات' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('id, slug, name, description, sort_order')
      .single();

    if (error) {
      console.error('Admin categories PATCH failed:', error);
      return NextResponse.json({ error: 'فشل تحديث التصنيف' }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Admin categories PATCH crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'معرّف التصنيف مطلوب' }, { status: 400 });
    }

    const { data: category } = await supabaseServer
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    if (category?.slug) {
      const { count } = await supabaseServer
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('category', category.slug);

      if ((count ?? 0) > 0) {
        return NextResponse.json(
          { error: `لا يمكن الحذف: يوجد ${count} خبر مرتبط بهذا التصنيف. انقل الأخبار أولاً.` },
          { status: 409 }
        );
      }
    }

    const { error } = await supabaseServer.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Admin categories DELETE failed:', error);
      return NextResponse.json({ error: 'فشل حذف التصنيف' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin categories DELETE crashed:', error);
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }
}
