import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const DEFAULT_LIMIT = 100;

type EditorSummary = {
  name: string;
  position: string | null;
};

function sanitizeSearchTerm(value: string) {
  return value.replace(/[{},]/g, ' ').replace(/[%]/g, '').trim();
}

function buildSearchFilter(query: string) {
  const term = sanitizeSearchTerm(query);

  return `title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%,keywords::text.ilike.%${term}%`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = (searchParams.get('id') || '').trim();
  const page = Math.max(Number(searchParams.get('page') || '1'), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || DEFAULT_LIMIT), 1), 100);
  const search = (searchParams.get('q') || '').trim();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (id) {
    const { data, error } = await supabaseServer
      .from('news')
      .select('id, title, slug, category, created_at, excerpt, keywords, meta_description, content, editor_id, editors(name, position)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Admin news single GET failed:', error);
      return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  }

  let countQuery = supabaseServer
    .from('news')
    .select('*', { count: 'exact', head: true });

  let dataQuery = supabaseServer
    .from('news')
    .select('id, title, slug, category, created_at, excerpt, keywords, meta_description, editor_id, editors(name, position)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    const filter = buildSearchFilter(search);
    countQuery = countQuery.or(filter);
    dataQuery = dataQuery.or(filter);
  }

  const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([countQuery, dataQuery]);

  if (search && (countError || dataError)) {
    let fallbackCountQuery = supabaseServer
      .from('news')
      .select('*', { count: 'exact', head: true });

    let fallbackDataQuery = supabaseServer
      .from('news')
      .select('id, title, slug, category, created_at, excerpt, keywords, meta_description, editor_id, editors(name, position)', { count: 'exact' })
      .or(`title.ilike.%${sanitizeSearchTerm(search)}%,excerpt.ilike.%${sanitizeSearchTerm(search)}%,content.ilike.%${sanitizeSearchTerm(search)}%`)
      .order('created_at', { ascending: false })
      .range(from, to);

    const [{ count: fallbackCount, error: fallbackCountError }, { data: fallbackData, error: fallbackDataError }] = await Promise.all([fallbackCountQuery.or(`title.ilike.%${sanitizeSearchTerm(search)}%,excerpt.ilike.%${sanitizeSearchTerm(search)}%,content.ilike.%${sanitizeSearchTerm(search)}%`), fallbackDataQuery]);

    if (fallbackCountError || fallbackDataError) {
      console.error('Admin news GET failed:', fallbackCountError || fallbackDataError);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    return NextResponse.json({
      items: fallbackData ?? [],
      pagination: {
        page,
        limit,
        total: fallbackCount ?? 0,
        totalPages: Math.max(Math.ceil((fallbackCount ?? 0) / limit), 1),
      },
    });
  }

  if (countError || dataError) {
    console.error('Admin news GET failed:', countError || dataError);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.max(Math.ceil((count ?? 0) / limit), 1),
    },
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0) : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('news').delete().in('id', ids);

    if (error) {
      console.error('Admin news DELETE failed:', error);
      return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Admin news DELETE error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';

    if (!id) {
      return NextResponse.json({ error: 'Missing news id' }, { status: 400 });
    }

    const updateData = {
      title: typeof body.title === 'string' ? body.title.trim() : undefined,
      content: typeof body.content === 'string' ? body.content.trim() : undefined,
      excerpt: typeof body.excerpt === 'string' ? body.excerpt.trim() : null,
      category: typeof body.category === 'string' ? body.category.trim() : undefined,
      editor_id: typeof body.editor_id === 'string' && body.editor_id.trim().length > 0 ? body.editor_id.trim() : null,
      meta_description: typeof body.meta_description === 'string' ? body.meta_description.trim() : null,
      keywords: Array.isArray(body.keywords)
        ? body.keywords.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : undefined,
    };

    const payload = Object.fromEntries(Object.entries(updateData).filter(([, value]) => value !== undefined));

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('news')
      .update(payload)
      .eq('id', id)
      .select('id, title, slug, category, created_at, excerpt, keywords, meta_description, content, editor_id, editors(name, position)')
      .single();

    if (error) {
      console.error('Admin news PATCH failed:', error);
      return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Admin news PATCH error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
