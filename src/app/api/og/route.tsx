import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/constants';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || SITE_NAME;
    const category = searchParams.get('category') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a2332',
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
            }}
          >
            {category && (
              <div
                style={{
                  background: 'linear-gradient(to right, #d4af37, #f4d03f)',
                  color: '#1a2332',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '32px',
                }}
              >
                {category}
              </div>
            )}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '1000px',
                marginBottom: '40px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #d4af37, #f4d03f)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {SITE_NAME}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
