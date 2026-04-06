import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateWordCount, optimizeSEO } from '@/lib/ai-seo';
import { syncLiveEventFromNews } from '@/lib/live-events';

const WEBHOOK_TOKEN = process.env.WEBHOOK_SECRET_TOKEN || '2080db46-34ae-40f6-bd22-1b88ca0bffa8';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getRandomEditorId(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('editors')
    .select('id');

  if (data && data.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex].id;
  }
  return crypto.randomUUID();
}

const AR_TO_EN: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'h', 'ء': 'a', 'ئ': 'e',
  'ؤ': 'w', 'لا': 'la',
};

function generateSlug(title: string): string {
  const transliterated = title
    .trim()
    .split('')
    .map(ch => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      if (ch === ' ' || ch === '-') return '-';
      return AR_TO_EN[ch] || '';
    })
    .join('');

  const cleaned = transliterated
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);

  const id = Date.now().toString(36).slice(-5);
  return `${cleaned}-${id}`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // --- Layer 1: Word count (no minimum enforced) ---
    const { wordCount } = validateWordCount(body.content);

    // --- Layer 2: AI SEO optimization ---
    const skipAI = body.skip_ai === true;
    let seoData = {
      title: body.title,
      excerpt: body.excerpt || null,
      meta_description: body.meta_description || body.excerpt || null,
      keywords: body.keywords || null,
      key_points: body.key_points || null,
    };

    let aiOptimized = false;

    let formattedContent = body.content;

    if (!skipAI && process.env.OPENAI_API_KEY) {
      try {
        const aiResult = await optimizeSEO(body.title, body.content, body.category || 'local');

        seoData = {
          title: aiResult.title || body.title,
          excerpt: body.excerpt || aiResult.excerpt || null,
          meta_description: aiResult.meta_description || body.excerpt || null,
          keywords: aiResult.keywords.length > 0 ? aiResult.keywords : body.keywords || null,
          key_points: aiResult.key_points.length > 0 ? aiResult.key_points : body.key_points || null,
        };
        
        // Use formatted content if available
        if (aiResult.formatted_content) {
          formattedContent = aiResult.formatted_content;
        }
        
        aiOptimized = true;
      } catch (aiError) {
        console.error('AI SEO optimization failed, proceeding without it:', aiError);
      }
    }

    // --- Build and insert news data ---
    const newsData = {
      id: body.id || crypto.randomUUID(),
      title: seoData.title,
      content: formattedContent,
      slug: body.slug || generateSlug(seoData.title),
      excerpt: seoData.excerpt,
      image_url: body.image_url || null,
      category: body.category || 'local',
      keywords: seoData.keywords,
      meta_description: seoData.meta_description,
      canonical_url: body.canonical_url || null,
      key_points: seoData.key_points,
      created_at: new Date().toISOString(),
      editor_id: body.editor_id || await getRandomEditorId(),
      location: body.location || null,
    };

    const { data, error } = await supabaseAdmin
      .from('news')
      .insert(newsData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to insert news', details: error.message },
        { status: 500 }
      );
    }

    try {
      await syncLiveEventFromNews(supabaseAdmin, {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        image_url: data.image_url,
        category: data.category,
        created_at: data.created_at,
      });
    } catch (liveEventError) {
      console.error('Live event sync failed:', liveEventError);
    }

    return NextResponse.json({
      success: true,
      message: 'News article created successfully',
      data: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        created_at: data.created_at,
      },
      wordCount,
      aiOptimized,
    }, { status: 201 });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhook-add-news',
    method: 'POST',
    auth: 'Bearer token required',
    validation: {
      minWordCount: 400,
      aiSeoOptimization: !!process.env.OPENAI_API_KEY,
    },
    options: {
      skip_ai: 'Set to true to skip AI SEO optimization',
    },
  });
}
