import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No AI API key configured' }, { status: 500 });
  }

  const { title, summary } = await req.json();

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const prompt = `أنت مساعد متخصص في توليد كلمات مفتاحية عربية للأخبار والأحداث الإخبارية.
بناءً على العنوان والوصف التالي، أنشئ قائمة من 10 إلى 15 كلمة مفتاحية عربية مناسبة للبحث والتصنيف والربط بالأخبار ذات الصلة.
أرجع الكلمات المفتاحية فقط مفصولة بفواصل بدون أي شرح أو ترقيم أو نقاط.
لا تضع "#" أمام الكلمات.

العنوان: ${title}
الوصف: ${summary || ''}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    const keywords = rawText
      .split(',')
      .map((k: string) => k.replace(/[#\n\r\d.]/g, '').trim())
      .filter(Boolean);

    return NextResponse.json({ keywords });
  } catch {
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
