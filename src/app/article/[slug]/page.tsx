import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsImage from '@/components/NewsImage';
import { supabaseServer } from '@/lib/supabase';
import { News } from '@/types/news';
import { getCategoryLabel, formatTimeAgo, safeKeywords } from '@/lib/utils';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '@/lib/constants';
import { articleSchema, withBreadcrumb } from '@/lib/schema';
import Navbar from '@/components/Navbar';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Footer from '@/components/Footer';
import ShareButtons from '@/components/ShareButtons';
import { Calendar, Tag, User, FileText, MapPin, Clock, HelpCircle, Settings } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';

export const dynamic = 'force-dynamic';

function getKeyPointIcon(point: string) {
  const lowerPoint = point.toLowerCase();
  if (lowerPoint.startsWith('من')) return User;
  if (lowerPoint.startsWith('ماذا') || lowerPoint.startsWith('ما ')) return FileText;
  if (lowerPoint.startsWith('أين')) return MapPin;
  if (lowerPoint.startsWith('متى')) return Clock;
  if (lowerPoint.startsWith('لماذا')) return HelpCircle;
  if (lowerPoint.startsWith('كيف')) return Settings;
  return FileText;
}

function getCategoryPath(category: string): string {
  const paths: Record<string, string> = {
    politics: '/politics', economy: '/economy', local: '/local', sports: '/sports',
  };
  return paths[category] || '/';
}

async function getArticle(slug: string): Promise<News | null> {
  try {
    // Try by slug first
    const { data: bySlug, error: slugError } = await supabaseServer
      .from('news')
      .select('*, editors(name, position, bio)')
      .eq('slug', decodeURIComponent(slug))
      .maybeSingle();

    if (slugError) {
      console.error('Error fetching by slug:', slugError.message);
    }

    if (bySlug) return bySlug;

    // Fallback: try by ID
    const { data: byId, error: idError } = await supabaseServer
      .from('news')
      .select('*, editors(name, position, bio)')
      .eq('id', slug)
      .maybeSingle();

    if (idError) {
      console.error('Error fetching by id:', idError.message);
    }

    return byId || null;
  } catch (e) {
    console.error('getArticle crashed:', e);
    return null;
  }
}

async function getRelatedNews(category: string, excludeId: string): Promise<News[]> {
  try {
    const { data } = await supabaseServer
      .from('news')
      .select('*, editors(name)')
      .eq('category', category)
      .neq('id', excludeId)
      .order('created_at', { ascending: false })
      .limit(4);
    return data || [];
  } catch (e) {
    console.error('getRelatedNews failed:', e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'المقال غير موجود',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const articleUrl = `${SITE_URL}/article/${article.slug || article.id}`;

  const seoTitle = `${article.title} | ${getCategoryLabel(article.category)}`;
  const seoDescription = article.meta_description || article.excerpt || article.title;
  const seoImage = article.image_url ? [article.image_url] : [];

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: safeKeywords(article.keywords).join(', ') || undefined,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: 'article',
      url: articleUrl,
      title: seoTitle,
      description: seoDescription,
      images: seoImage,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      section: getCategoryLabel(article.category),
      tags: safeKeywords(article.keywords),
      authors: article.editors?.name ? [article.editors.name] : [SITE_NAME],
      siteName: SITE_NAME,
      locale: 'ar_SA',
    },
    twitter: {
      card: article.image_url ? 'summary_large_image' : 'summary',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: seoTitle,
      description: seoDescription,
      images: seoImage,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedNews = await getRelatedNews(article.category, article.id);
  const articleUrl = `${SITE_URL}/article/${article.slug || article.id}`;

  let sanitizedContent = '';
  try {
    sanitizedContent = sanitizeHtml(article.content || '', {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'img', 'style'],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'class', 'style'],
        '*': ['class', 'style'],
      },
    });
  } catch (e) {
    console.error('sanitizeHtml failed:', e);
    sanitizedContent = article.content || '';
  }

  const plainText = (article.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const categoryLabel = getCategoryLabel(article.category);
  const articleLd = withBreadcrumb(
    articleSchema({
      title: article.title,
      description: article.meta_description || article.excerpt || article.title,
      url: articleUrl,
      imageUrl: article.image_url,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      authorName: article.editors?.name,
      authorJobTitle: article.editors?.position,
      authorBio: article.editors?.bio,
      sectionLabel: categoryLabel,
      keywords: safeKeywords(article.keywords),
      wordCount,
    }),
    [
      { name: 'الرئيسية', url: SITE_URL },
      { name: categoryLabel, url: `${SITE_URL}${getCategoryPath(article.category)}` },
      { name: article.title, url: articleUrl },
    ]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <Navbar />
      <NewsTickerWrapper />

      <article className="flex-1">
        {/* Breadcrumbs */}
        <div className="bg-secondary/50 border-b border-border">
          <Breadcrumbs items={[
            { label: getCategoryLabel(article.category), href: getCategoryPath(article.category) },
            { label: article.title, href: `/article/${article.slug || article.id}` },
          ]} />
        </div>

        {/* Category Header Bar */}
        <header className="bg-secondary border-b-2 border-gold py-4">
          <div className="container mx-auto px-4">
            <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-md font-bold">
              {getCategoryLabel(article.category)}
            </span>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 md:mb-8 leading-tight tracking-wide">
                {article.title}
              </h1>

              {/* Meta & Share */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-8 pb-4 md:pb-6 border-b-2 border-gold">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {article.editors && (
                    <span className="font-semibold text-foreground">✍️ {article.editors.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gold" aria-hidden="true" />
                    <time dateTime={article.created_at}>{formatTimeAgo(article.created_at)}</time>
                  </div>
                </div>
                <ShareButtons url={articleUrl} title={article.title} />
              </div>
            </header>

            {/* Article Image */}
            <figure className="mb-6 md:mb-8 rounded-lg overflow-hidden relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
              <NewsImage
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
                category={getCategoryLabel(article.category)}
              />
            </figure>

            {/* Author & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              {article.editors?.name && (
                <span className="font-semibold text-foreground">✍️ {article.editors.name}</span>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gold" />
                <time dateTime={article.created_at}>{formatTimeAgo(article.created_at)}</time>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <aside className="mb-6 md:mb-8 p-5 md:p-8 bg-secondary border-r-4 border-gold rounded-lg" role="complementary">
                <p className="text-lg md:text-2xl font-semibold leading-loose tracking-wide">{article.excerpt}</p>
              </aside>
            )}

            {/* Key Points - 5W+1H */}
            {Array.isArray(article.key_points) && article.key_points.length > 0 && (
              <aside className="mb-8 rounded-lg p-5 md:p-6 bg-secondary/40" role="complementary" aria-label="النقاط الرئيسية">
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                  <span className="w-1 h-8 bg-gold rounded-full"></span>
                  النقاط الرئيسية
                </h2>
                <ul className="space-y-3">
                  {article.key_points.map((point: string, index: number) => {
                    const Icon = getKeyPointIcon(point);
                    return (
                      <li key={index} className="flex items-start gap-3 text-lg leading-relaxed text-foreground">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10" aria-hidden="true">
                          <Icon className="h-4 w-4 text-gold" />
                        </span>
                        <span>{point}</span>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            )}

            {/* Article Content */}
            <section
              className="prose prose-2xl max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/* Editor Card */}
            {article.editors && (
              <aside className="mt-12 p-6 bg-secondary border border-border rounded-lg" role="complementary" aria-label="معلومات المحرر">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-2xl font-bold shrink-0">
                    {article.editors.name?.charAt(0) || '✍'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{article.editors.name || 'محرر'}</h3>
                    <p className="text-sm text-gold font-medium mb-2">{article.editors.position || 'محرر'}</p>
                    <p className="text-sm text-muted-foreground">{article.editors.bio || 'تحرير وإشراف على هذا المقال'}</p>
                  </div>
                </div>
              </aside>
            )}

            {/* Keywords / Internal Links */}
            {safeKeywords(article.keywords).length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Tag size={16} className="text-gold" />
                {safeKeywords(article.keywords).map((keyword) => (
                  <span key={keyword} className="inline-block bg-secondary text-sm text-muted-foreground px-3 py-1 rounded-full border border-border">
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* Category CTA */}
            <div className="mt-8 p-5 bg-secondary/50 border border-border rounded-lg flex items-center justify-between">
              <span className="text-foreground font-medium">تصفح المزيد من أخبار {getCategoryLabel(article.category)}</span>
              <Link href={getCategoryPath(article.category)} className="text-gold font-bold hover:underline">
                عرض الكل
              </Link>
            </div>

            {/* Related Articles */}
            {relatedNews.length > 0 && (
              <aside className="mt-16 pt-8 border-t-2 border-gold" role="complementary" aria-label="أخبار ذات صلة">
                <h2 className="text-2xl font-bold mb-6">أخبار ذات صلة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedNews.map((news) => (
                    <article key={news.id}>
                      <a href={`/article/${news.slug || news.id}`} className="group">
                        <div className="flex gap-4 p-4 border border-border rounded-lg hover:border-gold transition-all">
                          <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden relative">
                            <NewsImage
                              src={news.image_url}
                              alt={news.title}
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold group-hover:text-gold transition-colors line-clamp-2">
                              {news.title}
                            </h3>
                            <time className="text-sm text-muted-foreground mt-2 block" dateTime={news.created_at}>
                              {formatTimeAgo(news.created_at)}
                            </time>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
