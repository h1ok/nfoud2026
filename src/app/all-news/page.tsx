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
  title: 'جميع الأخبار – آخر الأخبار من جميع الأقسام',
  description: 'تصفح جميع الأخبار من مختلف الأقسام - سياسة، اقتصاد، محليات، رياضة على شبكة نفود الإخبارية.',
  keywords: 'أخبار، جميع الأخبار، السعودية، نفود',
  alternates: {
    canonical: `${SITE_URL}/all-news`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/all-news`,
    title: `جميع الأخبار | ${SITE_NAME}`,
    description: 'تصفح جميع الأخبار من مختلف الأقسام - سياسة، اقتصاد، محليات، رياضة على شبكة نفود الإخبارية.',
    siteName: SITE_NAME,
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `جميع الأخبار | ${SITE_NAME}`,
    description: 'تصفح جميع الأخبار من مختلف الأقسام - سياسة، اقتصاد، محليات، رياضة على شبكة نفود الإخبارية.',
  },
};

async function getAllNews(): Promise<News[]> {
  const { data, error } = await supabaseServer
    .from('news')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(48);

  if (error) {
    console.error('Error fetching all news:', error);
    return [];
  }

  return data || [];
}

export default async function AllNewsPage() {
  const news = await getAllNews();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />

      <div className="bg-secondary/50 border-b border-border">
        <Breadcrumbs items={[{ label: 'جميع الأخبار', href: '/all-news' }]} />
      </div>
      
      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="text-gold" size={36} aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">جميع الأخبار</h1>
          </div>
          <p className="text-base md:text-xl text-gold">تصفح آخر الأخبار من جميع الأقسام</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <section aria-label="قائمة جميع الأخبار">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {news.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار متاحة حالياً</p>
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
