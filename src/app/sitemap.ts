import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articlesResult, eventsResult] = await Promise.all([
    supabase
      .from('news')
      .select('id, slug, updated_at, created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('live_events')
      .select('id, slug, updated_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const articleUrls = (articlesResult.data || []).map((article) => ({
    url: `${SITE_URL}/article/${article.slug || article.id}`,
    lastModified: article.updated_at || article.created_at,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const eventUrls = (eventsResult.data || []).map((event) => ({
    url: `${SITE_URL}/live/${event.slug || event.id}`,
    lastModified: event.updated_at || event.created_at,
    changeFrequency: 'always' as const,
    priority: 0.9,
  }));

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/politics`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/economy`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/local`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sports`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/live`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/all-news`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.85,
    },
  ];

  return [...staticPages, ...eventUrls, ...articleUrls];
}
