import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'شبكة نفود الإخبارية';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
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
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a2332 0%, #0f1923 50%, #1a2332 100%)',
          fontFamily: fontData ? 'Cairo' : 'Arial',
          direction: 'rtl',
          gap: '24px',
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            background: 'linear-gradient(90deg, #c8960c, #e6b422, #c8960c)',
            borderRadius: '2px',
          }}
        />

        {/* Site name */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#e6b422',
            margin: 0,
          }}
        >
          نفود
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: '28px',
            color: '#ffffff',
            margin: 0,
            textAlign: 'center',
          }}
        >
          أول شبكة أخبار سعودية بالذكاء الاصطناعي
        </p>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          {['سياسة', 'اقتصاد', 'محليات', 'رياضة'].map((cat) => (
            <div
              key={cat}
              style={{
                border: '1px solid #e6b422',
                color: '#e6b422',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '18px',
              }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            fontSize: '20px',
            color: '#8899aa',
            margin: 0,
            marginTop: '24px',
          }}
        >
          nfoud.com
        </p>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Cairo', data: fontData, style: 'normal' as const, weight: 700 as const }]
        : [],
    },
  );
}
