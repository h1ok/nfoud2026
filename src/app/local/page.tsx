import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { News } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Newspaper } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'الأخبار المحلية – أحداث من داخل المملكة',
  description: 'آخر الأخبار المحلية من مختلف مناطق المملكة العربية السعودية - أحداث وفعاليات محلية على شبكة نفود الإخبارية.',
  keywords: 'محليات، أخبار محلية، السعودية، المدن السعودية، أحداث محلية',
};

async function getLocalNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*', { count: 'exact' })
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
      
      <header className="bg-primary text-primary-foreground py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Newspaper className="text-gold" size={48} aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold">الأخبار المحلية</h1>
          </div>
          <p className="text-xl text-gold">أخبار من داخل المملكة العربية السعودية</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <section aria-label="قائمة الأخبار المحلية">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
