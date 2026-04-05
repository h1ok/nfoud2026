import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/constants';

export async function GET() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  
  const searchEngines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  try {
    const results = await Promise.allSettled(
      searchEngines.map(url => fetch(url))
    );

    return NextResponse.json({
      success: true,
      pinged: searchEngines.length,
      results: results.map((r, i) => ({
        engine: i === 0 ? 'Google' : 'Bing',
        status: r.status === 'fulfilled' ? 'success' : 'failed',
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
