import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { LiveEvent } from '@/types/news';
import LiveEventCard from '@/components/LiveEventCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { Radio, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الأحداث الحية',
  description: 'تابع الأحداث الحية والتغطيات المباشرة للأخبار العاجلة',
  keywords: 'أحداث حية، تغطية مباشرة، أخبار عاجلة',
  alternates: {
    canonical: `${SITE_URL}/live`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/live`,
    title: `الأحداث الحية | ${SITE_NAME}`,
    description: 'تابع الأحداث الحية والتغطيات المباشرة للأخبار العاجلة على شبكة نفود الإخبارية.',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `الأحداث الحية | ${SITE_NAME}`,
    description: 'تابع الأحداث الحية والتغطيات المباشرة للأخبار العاجلة على شبكة نفود الإخبارية.',
  },
};

async function getLiveEvents(): Promise<LiveEvent[]> {
  const { data, error } = await supabaseServer
    .from('live_events')
    .select('*, live_event_updates(count)')
    .in('status', ['active', 'ended', 'archived'])
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching live events:', error);
    return [];
  }

  return data?.map(event => ({
    ...event,
    updates_count: event.live_event_updates?.[0]?.count || 0
  })).filter(event => event.status === 'active' || (event.updates_count || 0) > 0) || [];
}

export default async function LiveEventsPage() {
  const events = await getLiveEvents();
  const activeEvents = events.filter(e => e.status === 'active');
  const endedEvents = events.filter(e => e.status === 'ended');
  const archivedEvents = events.filter(e => e.status === 'archived');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Radio className="text-destructive animate-pulse" size={36} aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">الأحداث الحية</h1>
          </div>
          <p className="text-base md:text-xl text-gold">تابع التغطيات المباشرة للأخبار العاجلة</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {activeEvents.length > 0 && (
          <section className="mb-12" aria-labelledby="active-events-heading">
            <h2 id="active-events-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
              مباشر الآن
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {endedEvents.length > 0 && (
          <section aria-labelledby="ended-events-heading">
            <h2 id="ended-events-heading" className="text-2xl font-bold mb-6">أحداث منتهية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {archivedEvents.length > 0 && (
          <section className="mt-12" aria-labelledby="archived-events-heading">
            <details className="group rounded-2xl border border-border bg-card p-5 shadow-sm">
              <summary id="archived-events-heading" className="list-none cursor-pointer">
                <span className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-bold transition-colors text-lg group-open:mb-3">
                  <ChevronLeft size={20} className="transition-transform group-open:-rotate-90" aria-hidden="true" />
                  عرض المزيد (الأحداث المؤرشفة)
                </span>
              </summary>
              <p className="mt-3 mb-6 text-muted-foreground">جميع الأحداث المؤرشفة السابقة المتاحة للمراجعة.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedEvents.map((event) => (
                  <LiveEventCard key={event.id} event={event} />
                ))}
              </div>
            </details>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لا توجد أحداث حية حالياً</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
