import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase';
import { LiveEvent } from '@/types/news';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '@/lib/constants';
import { liveBlogSchema, breadcrumbSchema, type LiveUpdateInput } from '@/lib/schema';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Radio, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface LiveEventUpdate {
  id: string;
  content: string;
  created_at: string;
  update_type: string;
  source_news_id: string | null;
  source_news_slug?: string | null;
  source_news_image_url?: string | null;
}

function buildNewsDetailsUrl(newsId: string | null, slug?: string | null) {
  if (slug && slug.trim().length > 0) {
    return `/article/${slug}`;
  }

  if (newsId) {
    return `/article/${newsId}`;
  }

  return null;
}

function buildUnifiedUpdateContent(update: LiveEventUpdate) {
  const detailsUrl = buildNewsDetailsUrl(update.source_news_id, update.source_news_slug);

  if (!detailsUrl || update.content.includes('اقرأ التفاصيل الكاملة عبر الرابط')) {
    return update.content;
  }

  return `${update.content}<br /><br /><a href="${detailsUrl}" class="text-gold font-bold hover:underline">اقرأ التفاصيل الكاملة عبر الرابط</a>`;
}

async function getLiveEvent(id: string): Promise<LiveEvent | null> {
  const { data, error } = await supabaseServer
    .from('live_events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getLiveEventUpdates(eventId: string): Promise<LiveEventUpdate[]> {
  const { data, error } = await supabaseServer
    .from('live_event_updates')
    .select('*')
    .eq('live_event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching live event updates:', error);
    return [];
  }

  const baseUpdates = (data || []) as LiveEventUpdate[];
  const sourceNewsIds = [...new Set(baseUpdates.map((item) => item.source_news_id).filter(Boolean))] as string[];

  if (sourceNewsIds.length === 0) {
    return baseUpdates;
  }

  const { data: newsItems, error: newsError } = await supabaseServer
    .from('news')
    .select('id, slug, image_url')
    .in('id', sourceNewsIds);

  if (newsError) {
    return baseUpdates;
  }

  const newsMap = new Map(
    ((newsItems || []) as Array<{ id: string; slug: string | null; image_url: string | null }>).map((item) => [item.id, item])
  );

  return baseUpdates.map((item) => ({
    ...item,
    source_news_slug: item.source_news_id ? newsMap.get(item.source_news_id)?.slug ?? null : null,
    source_news_image_url: item.source_news_id ? newsMap.get(item.source_news_id)?.image_url ?? null : null,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getLiveEvent(id);

  if (!event) {
    return {
      title: 'الحدث غير موجود',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const liveEventUrl = `${SITE_URL}/live/${event.id}`;
  const description = event.summary || event.title;
  const keywords = `حدث مباشر، ${getCategoryLabel(event.category)}، تغطية حية`;

  return {
    title: `${event.title} - تغطية مباشرة`,
    description,
    keywords,
    alternates: {
      canonical: liveEventUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'article',
      url: liveEventUrl,
      title: `${event.title} - تغطية مباشرة`,
      description,
      images: event.main_image_url ? [{ url: event.main_image_url }] : [],
      publishedTime: event.created_at,
      modifiedTime: event.updated_at || event.created_at,
      section: getCategoryLabel(event.category),
      siteName: SITE_NAME,
      locale: 'ar_SA',
    },
    twitter: {
      card: event.main_image_url ? 'summary_large_image' : 'summary',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: `${event.title} - تغطية مباشرة`,
      description,
      images: event.main_image_url ? [event.main_image_url] : [],
    },
  };
}

export default async function LiveEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, updates] = await Promise.all([
    getLiveEvent(id),
    getLiveEventUpdates(id)
  ]);

  if (!event) {
    notFound();
  }

  const isActive = event.status === 'active';
  const heroImage = event.main_image_url || updates.find((update) => update.source_news_image_url)?.source_news_image_url || null;

  const liveEventUrl = `${SITE_URL}/live/${event.id}`;
  const categoryLabel = getCategoryLabel(event.category);
  const liveLd = liveBlogSchema({
    title: event.title,
    description: event.summary || event.title,
    url: liveEventUrl,
    imageUrl: heroImage,
    datePublished: event.created_at,
    dateModified: event.updated_at || event.created_at,
    isActive,
    sectionLabel: categoryLabel,
    updates: updates.map<LiveUpdateInput>((update) => ({
      id: update.id,
      content: update.content,
      created_at: update.created_at,
    })),
  });
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    ...breadcrumbSchema([
      { name: 'الرئيسية', url: SITE_URL },
      { name: 'التغطيات الحية', url: `${SITE_URL}/live` },
      { name: event.title, url: liveEventUrl },
    ]),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(liveLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-2xl shadow-elegant overflow-hidden border border-border/50">
          {heroImage && (
            <div className="relative w-full h-96">
              <Image
                src={heroImage}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              {isActive && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 font-semibold">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>مباشر</span>
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-6">
              <span className="bg-accent text-accent-foreground px-4 py-1.5 rounded-md text-sm font-bold">
                {getCategoryLabel(event.category)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight text-foreground">
              {event.title}
            </h1>

            {event.summary && (
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                {event.summary}
              </p>
            )}

            <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-6 border-b-2 border-gold">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                <span>آخر تحديث: {formatDate(event.updated_at)}</span>
              </div>
              <span className="text-border">•</span>
              <span>{updates.length} تحديث</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground">التحديثات المباشرة</h2>
              
              {updates.length === 0 ? (
                <div className="text-center py-12 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">لا توجد تحديثات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div 
                      key={update.id}
                      id={`update-${update.id}`}
                      className={`border-r-4 pr-6 py-4 ${
                        index === 0 && isActive
                          ? 'border-destructive bg-destructive/5'
                          : 'border-border bg-secondary'
                      } rounded-lg`}
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(update.created_at)}</span>
                        {index === 0 && isActive && (
                          <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs font-semibold">
                            جديد
                          </span>
                        )}
                      </div>
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: buildUnifiedUpdateContent(update) }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isActive && (
              <div className="mt-8 p-4 bg-secondary rounded-lg text-center">
                <p className="text-muted-foreground">انتهت التغطية المباشرة لهذا الحدث</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
