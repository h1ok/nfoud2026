import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

// ✅ هذا السطر يحل مشكلة البناء - يمنع Next.js من التحليل الـ static
export const dynamic = 'force-dynamic';

const WEBHOOK_TOKEN = process.env.WEBHOOK_NEWS_TOKEN;

const ALLOWED_FIELDS = [
  'title', 'excerpt', 'content', 'image_url', 'category',
  'keywords', 'meta_description', 'slug', 'canonical_url',
  'key_points', 'location', 'editor_id', 'status',
] as const;

function generateSlug(title: string): string {
  return (
    title
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\-]/g, '')
      .substring(0, 120)
      .replace(/-+$/, '') || `news-${Date.now()}`
  );
}

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. التحقق من التوكن
    if (!WEBHOOK_TOKEN) {
      console.error('[webhook-add-news] WEBHOOK_NEWS_TOKEN is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const auth = request.headers.get('authorization');
    if (!auth || auth !== `Bearer ${WEBHOOK_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. قراءة الـ body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // ✅ 3. التحقق من الحقول المطلوبة
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title and content' },
        { status: 400 }
      );
    }

    // ✅ 4. بناء الـ record
    const record: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        record[field] = body[field];
      }
    }

    if (!record.status) record.status = 'published';

    if (!record.slug) {
      record.slug = generateSlug(body.title as string);
    }

    if (!record.excerpt && body.content) {
      const plain = (body.content as string)
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      record.excerpt = plain.substring(0, 200);
    }

    // ✅ 5. الإدراج - supabaseAdmin يُنشأ هنا فقط (وليس أثناء البناء)
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('news')
      .insert(record)
      .select('id, slug, title, category, created_at')
      .single();

    if (error) {
      console.error('[webhook-add-news] Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint:    error.hint,
        code:    error.code,
      });
      return NextResponse.json(
        {
          error:   'Failed to insert news',
          message: error.message,
          hint:    error.hint,
          code:    error.code,
        },
        { status: 500 }
      );
    }

    // ✅ 6. إعادة التحقق من الكاش
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/all-news', 'page');
      if (data.category) revalidatePath(`/${data.category}`, 'page');
    } catch (e) {
      console.error('[webhook-add-news] Revalidation error:', e);
    }

    return NextResponse.json(
      {
        success: true,
        news: {
          id:         data.id,
          slug:       data.slug,
          title:      data.title,
          category:   data.category,
          created_at: data.created_at,
        },
      },
      { status: 201 }
    );

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[webhook-add-news] Unexpected error:', e);
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
