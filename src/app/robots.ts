import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard-control-panel-2025/',
          '/auth/',
          '/init-super-admin/',
          '/api/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard-control-panel-2025/',
          '/auth/',
          '/init-super-admin/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
        disallow: [
          '/dashboard-control-panel-2025/',
          '/auth/',
          '/init-super-admin/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
