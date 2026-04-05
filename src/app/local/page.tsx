import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase';
import { News } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { Newspaper } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الأخبار المحلية – أحداث من داخل المملكة',
  description: 'آخر الأخبار المحلية من مختلف مناطق المملكة العربية السعودية - أحداث وفعاليات محلية على شبكة نفود الإخبارية.',
  keywords: 'محليات، أخبار محلية، السعودية، المدن السعودية، أحداث محلية',
  alternates: {
    canonical: `${SITE_URL}/local`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/local`,
    title: `الأخبار المحلية | ${SITE_NAME}`,
    description: 'آخر الأخبار المحلية من مختلف مناطق المملكة العربية السعودية - أحداث وفعاليات محلية على شبكة نفود الإخبارية.',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `الأخبار المحلية | ${SITE_NAME}`,
    description: 'آخر الأخبار المحلية من مختلف مناطق المملكة العربية السعودية - أحداث وفعاليات محلية على شبكة نفود الإخبارية.',
  },
};

async function getLocalNews(): Promise<News[]> {
  const { data, error } = await supabaseServer
    .from('news')
    .select('*, editors(name, position)')
    .eq('category', 'local')
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error('Error fetching local news:', error);
    return [];
  }

  return data || [];
}

export default async function LocalPage() {
  const news = await getLocalNews();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />

      <div className="bg-secondary/50 border-b border-border">
        <Breadcrumbs items={[{ label: 'محليات', href: '/local' }]} />
      </div>
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="text-gold" size={36} aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">الأخبار المحلية</h1>
          </div>
          <p className="text-base md:text-xl text-gold">أخبار من داخل المملكة العربية السعودية</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <section aria-label="قائمة الأخبار المحلية">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {news.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار محلية متاحة حالياً</p>
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
