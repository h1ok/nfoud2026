import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'شبكة نفود الإخبارية';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const CATEGORY_LABELS: Record<string, string> = {
  politics: 'سياسة',
  economy: 'اقتصاد',
  local: 'محليات',
  sports: 'رياضة',
};

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: article } = await supabase
    .from('news')
    .select('title, category, excerpt, editors(name)')
    .eq('slug', decodeURIComponent(slug))
    .maybeSingle();

  const title = article?.title || 'شبكة نفود الإخبارية';
  const category = CATEGORY_LABELS[article?.category] || 'أخبار';
  const editors = article?.editors as unknown as { name: string } | null;
  const author = editors?.name || 'فريق تحرير نفود';

  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch('https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap');
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/src:\s*url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontFileRes = await fetch(fontUrlMatch[1]);
      fontData = await fontFileRes.arrayBuffer();
    }
  } catch {
    // fallback: no custom font
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1a2332 0%, #0f1923 50%, #1a2332 100%)',
          fontFamily: fontData ? 'Cairo' : 'Arial',
          direction: 'rtl',
          padding: '60px',
        }}
      >
        {/* Top: Category badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #c8960c, #e6b422, #c8960c)',
              color: '#1a2332',
              padding: '10px 28px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            {category}
          </div>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 80 ? '36px' : title.length > 50 ? '42px' : '48px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.4,
              margin: 0,
              textAlign: 'right',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: Author + Branding */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #e6b422',
            paddingTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#e6b422', fontSize: '20px', fontWeight: 700 }}>
              {author}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#e6b422', fontSize: '28px', fontWeight: 700 }}>
              نفود
            </span>
            <span style={{ color: '#8899aa', fontSize: '18px' }}>
              nfoud.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Cairo', data: fontData, style: 'normal', weight: 700 }]
        : [],
    },
  );
}
