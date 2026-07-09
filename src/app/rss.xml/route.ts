import { supabaseServer } from '@/lib/supabase';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export async function GET() {
  try {
    const { data: articles } = await supabaseServer
      .from('news')
      .select('id, slug, title, excerpt, created_at, category, image_url')
      .order('created_at', { ascending: false })
      .limit(50);

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${(articles || []).map((article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/article/${article.slug || article.id}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${article.slug || article.id}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
      <category>${article.category}</category>
      ${article.image_url ? `<enclosure url="${article.image_url}" length="0" type="image/jpeg" />` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);

    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    });
  }
}
