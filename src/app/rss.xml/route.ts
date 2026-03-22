import { supabase } from '@/lib/supabase';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export async function GET() {
  const { data: articles } = await supabase
    .from('news')
    .select('id, slug, title, excerpt, meta_description, created_at, updated_at, category, image_url')
    .order('created_at', { ascending: false })
    .limit(100);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <ttl>60</ttl>
    <image>
      <url>${SITE_URL}/nafud-logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    ${(articles || []).map((article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/article/${article.slug || article.id}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${article.slug || article.id}</guid>
      <description><![CDATA[${article.meta_description || article.excerpt || ''}]]></description>
      <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
      <category><![CDATA[${article.category}]]></category>
      <dc:creator>${SITE_NAME}</dc:creator>
      ${article.image_url ? `<enclosure url="${article.image_url}" type="image/jpeg" />` : ''}
      ${article.image_url ? `<media:content url="${article.image_url}" medium="image" />` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
