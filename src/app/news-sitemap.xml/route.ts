import { supabaseServer } from '@/lib/supabase';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

// Google News sitemap: only articles published within the last 48 hours,
// max 1000 URLs. Uses the news:news namespace required by Google News.
export const dynamic = 'force-dynamic';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type NewsRow = {
  id: string;
  slug: string | null;
  title: string;
  created_at: string;
  updated_at: string | null;
  image_url: string | null;
  keywords: string[] | null;
};

function buildXml(articles: NewsRow[]): string {
  const items = articles
    .map((article) => {
      const loc = `${SITE_URL}/article/${article.slug || article.id}`;
      const publicationDate = new Date(article.created_at).toISOString();
      const title = escapeXml(article.title || '');
      const keywords = (article.keywords || []).filter(Boolean).join(', ');
      const image = article.image_url
        ? `
    <image:image>
      <image:loc>${escapeXml(article.image_url)}</image:loc>
    </image:image>`
        : '';

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title>${title}</news:title>${keywords ? `
      <news:keywords>${escapeXml(keywords)}</news:keywords>` : ''}
    </news:news>${image}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>`;
}

export async function GET() {
  const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;

  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseServer
      .from('news')
      .select('id, slug, title, created_at, updated_at, image_url, keywords')
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('news-sitemap query failed:', error);
      return new Response(emptyXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    const xml = buildXml((data as NewsRow[]) || []);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch (err) {
    console.error('Failed to generate news sitemap:', err);
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}
