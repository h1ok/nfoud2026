import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { News } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { Trophy } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الأخبار الرياضية – كرة القدم والرياضات',
  description: 'آخر الأخبار الرياضية من السعودية والعالم - دوري روشن، كرة القدم، والرياضات المختلفة على شبكة نفود الإخبارية.',
  keywords: 'رياضة، كرة قدم، أخبار رياضية، السعودية، دوري روشن',
  alternates: {
    canonical: `${SITE_URL}/sports`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/sports`,
    title: `الأخبار الرياضية | ${SITE_NAME}`,
    description: 'آخر الأخبار الرياضية من السعودية والعالم - دوري روشن، كرة القدم، والرياضات المختلفة على شبكة نفود الإخبارية.',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `الأخبار الرياضية | ${SITE_NAME}`,
    description: 'آخر الأخبار الرياضية من السعودية والعالم - دوري روشن، كرة القدم، والرياضات المختلفة على شبكة نفود الإخبارية.',
  },
};

async function getSportsNews(): Promise<News[]> {
  const { data, error } = await supabaseServer
    .from('news')
    .select('*', { count: 'exact' })
    .eq('category', 'sports')
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error('Error fetching sports news:', error);
    return [];
  }

  return data || [];
}

export default async function SportsPage() {
  const news = await getSportsNews();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />

      <div className="bg-secondary/50 border-b border-border">
        <Breadcrumbs items={[{ label: 'رياضة', href: '/sports' }]} />
      </div>
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-gold" size={36} aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">الأخبار الرياضية</h1>
          </div>
          <p className="text-base md:text-xl text-gold">كل ما يخص الرياضة من السعودية والعالم</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <section aria-label="قائمة الأخبار الرياضية">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {news.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار رياضية متاحة حالياً</p>
              </div>
            ) : (
              news.map((article) => (
                <article key={article.id}>
                  <NewsCard news={article} />
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
