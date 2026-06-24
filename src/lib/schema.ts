import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';

// ============================================================
// Centralized JSON-LD schema builders (schema.org)
// Using stable @id references so Google can link entities
// (Organization <- WebSite <- WebPage <- Article/LiveBlog).
// ============================================================

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const SOCIAL_PROFILES = [
  'https://x.com/Nfoud_ai',
  'https://www.instagram.com/nfooud.ai/',
  'https://www.tiktok.com/@nfoud_ai',
];

const LOGO = {
  '@type': 'ImageObject',
  '@id': `${SITE_URL}/#logo`,
  url: `${SITE_URL}/favicon.png`,
  width: 512,
  height: 512,
  caption: SITE_NAME,
};

export function organizationSchema() {
  return {
    '@type': 'NewsMediaOrganization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: 'Nfoud',
    url: SITE_URL,
    logo: LOGO,
    image: { '@id': `${SITE_URL}/#logo` },
    description: SITE_DESCRIPTION,
    foundingDate: '2025',
    sameAs: SOCIAL_PROFILES,
    areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
    inLanguage: 'ar',
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'ar',
    publisher: { '@id': ORG_ID },
  };
}

// Combined site-wide graph injected once in the root layout.
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema()],
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished: string;
  dateModified?: string | null;
  authorName?: string | null;
  authorJobTitle?: string | null;
  authorBio?: string | null;
  sectionLabel: string;
  keywords: string[];
  wordCount: number;
}

export function articleSchema(input: ArticleSchemaInput) {
  const image = input.imageUrl
    ? { '@type': 'ImageObject', url: input.imageUrl, width: 1200, height: 630 }
    : { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png`, width: 512, height: 512 };

  const author = input.authorName
    ? {
        '@type': 'Person',
        name: input.authorName,
        jobTitle: input.authorJobTitle || 'محرر',
        description: input.authorBio || undefined,
        url: SITE_URL,
        worksFor: { '@id': ORG_ID },
      }
    : { '@id': ORG_ID };

  return {
    '@type': 'NewsArticle',
    headline: input.title,
    name: input.title,
    description: input.description,
    image,
    thumbnailUrl: input.imageUrl || `${SITE_URL}/favicon.png`,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author,
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    url: input.url,
    articleSection: input.sectionLabel,
    keywords: input.keywords.join(', ') || undefined,
    wordCount: input.wordCount,
    inLanguage: 'ar',
    isAccessibleForFree: true,
    copyrightHolder: { '@id': ORG_ID },
    copyrightYear: new Date(input.datePublished || Date.now()).getFullYear(),
  };
}

export interface LiveUpdateInput {
  id: string;
  content: string;
  created_at: string;
}

export interface LiveBlogSchemaInput {
  title: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  datePublished: string;
  dateModified: string;
  isActive: boolean;
  sectionLabel: string;
  updates: LiveUpdateInput[];
}

// LiveBlogPosting is the correct type for live coverage / live blogs.
// coverageStartTime/EndTime + liveBlogUpdate entries enable rich results.
export function liveBlogSchema(input: LiveBlogSchemaInput) {
  const sorted = [...input.updates].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const coverageStartTime = sorted[0]?.created_at || input.datePublished;
  const lastUpdate = sorted[sorted.length - 1]?.created_at || input.dateModified;

  const image = input.imageUrl
    ? { '@type': 'ImageObject', url: input.imageUrl, width: 1200, height: 630 }
    : { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png`, width: 512, height: 512 };

  return {
    '@context': 'https://schema.org',
    '@type': 'LiveBlogPosting',
    '@id': `${input.url}#liveblog`,
    headline: input.title,
    name: input.title,
    description: input.description,
    image,
    url: input.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    coverageStartTime,
    // While active, omit coverageEndTime; once ended use last update time.
    ...(input.isActive ? {} : { coverageEndTime: lastUpdate }),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: input.sectionLabel,
    inLanguage: 'ar',
    liveBlogUpdate: sorted.map((update) => {
      const text = update.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        '@type': 'BlogPosting',
        '@id': `${input.url}#update-${update.id}`,
        headline: text.slice(0, 110) || input.title,
        articleBody: text,
        datePublished: update.created_at,
        dateModified: update.created_at,
        url: `${input.url}#update-${update.id}`,
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        inLanguage: 'ar',
      };
    }),
  };
}

// Helper to wrap a schema object into a graph with breadcrumb attached.
export function withBreadcrumb<T extends Record<string, unknown>>(
  schema: T,
  breadcrumbs: BreadcrumbItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [schema, breadcrumbSchema(breadcrumbs)],
  };
}
