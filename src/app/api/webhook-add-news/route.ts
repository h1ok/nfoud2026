import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

const WEBHOOK_TOKEN = process.env.WEBHOOK_NEWS_TOKEN;

const ALLOWED_FIELDS = [
  'title', 'excerpt', 'content', 'image_url', 'category',
  'keywords', 'meta_description', 'slug', 'canonical_url',
  'key_points', 'location', 'editor_id', 'status',
] as const;

function generateSlug(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\-]/g, '')
    .substring(0, 120)
    .replace(/-+$/, '')
    || `news-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || auth !== `Bearer ${WEBHOOK_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title and content' },
        { status: 400 }
      );
    }

    const record: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined && body[field] !== null) {
        record[field] = body[field];
      }
    }

    if (!record.status) {
      record.status = 'published';
    }

    if (!record.slug) {
      record.slug = generateSlug(body.title);
    }

    if (!record.excerpt && body.content) {
      const plain = (body.content as string)
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      record.excerpt = plain.substring(0, 200);
    }

    const { data, error } = await supabase
      .from('news')
      .insert(record)
      .select('id, slug, title, category, created_at')
      .single();

    if (error) {
      console.error('[webhook-add-news] Supabase insert error:', error.message, error.details);
      return NextResponse.json(
        { error: 'Failed to insert news', details: error.message },
        { status: 500 }
      );
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/all-news', 'page');
      if (data.category) {
        revalidatePath(`/${data.category}`, 'page');
      }
    } catch (e) {
      console.error('[webhook-add-news] Revalidation error:', e);
    }

    return NextResponse.json({
      success: true,
      news: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        created_at: data.created_at,
      },
    }, { status: 201 });

  } catch (e: any) {
    console.error('[webhook-add-news] Unexpected error:', e);
    return NextResponse.json(
      { error: 'Internal server error', details: e?.message },
      { status: 500 }
    );
  }
}
