const MIN_WORD_COUNT = 400;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface SEOData {
  title: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  key_points: string[];
  formatted_content?: string;
}

/**
 * Count Arabic/mixed words in text (strips HTML tags first)
 */
export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ');
  const words = stripped.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Validate that article content meets minimum word count
 */
export function validateWordCount(content: string): { valid: boolean; wordCount: number } {
  const wordCount = countWords(content);
  return { valid: wordCount >= MIN_WORD_COUNT, wordCount };
}

/**
 * Use OpenAI to optimize article metadata for SEO (using fetch directly)
 */
export async function optimizeSEO(
  title: string,
  content: string,
  category: string,
): Promise<SEOData> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const strippedContent = content.replace(/<[^>]*>/g, '').trim();

  const prompt = `أنت خبير SEO متخصص في المحتوى الإخباري العربي. قم بتحليل المقال التالي وأنتج بيانات SEO محسّنة.

**عنوان المقال:** ${title}
**التصنيف:** ${category}
**محتوى المقال:**
${strippedContent.substring(0, 3000)}

أنتج JSON فقط بدون أي نص إضافي بالتنسيق التالي:
{
  "title": "عنوان محسّن للسيو (60-70 حرف)",
  "excerpt": "ملخص جذاب (150-200 حرف)",
  "meta_description": "وصف ميتا محسّن (150-160 حرف)",
  "keywords": ["كلمة 1", "كلمة 2", "..."],
  "key_points": [
    "من؟ [الإجابة هنا]",
    "ماذا؟ [الإجابة هنا]",
    "أين؟ [الإجابة هنا]",
    "متى؟ [الإجابة هنا]",
    "لماذا؟ [الإجابة هنا]",
    "كيف؟ [الإجابة هنا]"
  ],
  "formatted_content": "المحتوى مقسم على 3 فقرات بتنسيق HTML"
}

تعليمات إلزامية:
1. النقاط الرئيسية (key_points) يجب أن تكون بالضبط 6 نقاط تتبع 5W+1H:
   - النقطة الأولى تبدأ بـ "من؟" متبوعة بالإجابة
   - النقطة الثانية تبدأ بـ "ماذا؟" متبوعة بالإجابة
   - النقطة الثالثة تبدأ بـ "أين؟" متبوعة بالإجابة
   - النقطة الرابعة تبدأ بـ "متى؟" متبوعة بالإجابة
   - النقطة الخامسة تبدأ بـ "لماذا؟" متبوعة بالإجابة
   - النقطة السادسة تبدأ بـ "كيف؟" متبوعة بالإجابة

2. formatted_content يجب أن يحتوي على المحتوى الأصلي مقسماً إلى 3 فقرات HTML:
   - قسّم النص إلى 3 أجزاء متساوية تقريباً
   - كل فقرة داخل <p>...</p>
   - احتفظ بالتنسيق الأصلي للنص

مثال للنقاط الرئيسية:
[
  "من؟ الرئيس الأمريكي دونالد ترامب ومجتبى خامنئي",
  "ماذا؟ تغريدة تشير إلى انفتاح ترامب على فكرة اغتيال خامنئي",
  "أين؟ عبر منصة تويتر",
  "متى؟ مؤخراً دون تحديد تاريخ دقيق",
  "لماذا؟ التوترات السياسية بين الولايات المتحدة وإيران",
  "كيف؟ عبر تغريدة تفتقر إلى مصادر رسمية موثوقة"
]`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير SEO للمحتوى الإخباري العربي. أجب بـ JSON فقط بدون markdown أو أي نص إضافي.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
    }

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(raw) as SEOData;

    // Validate and sanitize the response
    return {
      title: typeof parsed.title === 'string' && parsed.title.length > 10
        ? parsed.title.substring(0, 120)
        : title,
      excerpt: typeof parsed.excerpt === 'string' && parsed.excerpt.length > 20
        ? parsed.excerpt.substring(0, 300)
        : '',
      meta_description: typeof parsed.meta_description === 'string' && parsed.meta_description.length > 20
        ? parsed.meta_description.substring(0, 200)
        : '',
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((k): k is string => typeof k === 'string' && k.length > 1).slice(0, 10)
        : [],
      key_points: Array.isArray(parsed.key_points)
        ? parsed.key_points.filter((p): p is string => typeof p === 'string' && p.length > 5).slice(0, 6)
        : [],
      formatted_content: typeof parsed.formatted_content === 'string' && parsed.formatted_content.length > 50
        ? parsed.formatted_content
        : undefined,
    };
  } catch (error) {
    console.error('AI SEO optimization failed:', error);
    // Return empty/fallback - article will still be published without AI optimization
    return {
      title,
      excerpt: '',
      meta_description: '',
      keywords: [],
      key_points: [],
    };
  }
}
