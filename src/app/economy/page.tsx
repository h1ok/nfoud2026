import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { News } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrendingUp } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'أخبار الاقتصاد – تحليلات وتقارير اقتصادية',
  description: 'آخر الأخبار الاقتصادية من المملكة العربية السعودية والعالم - تحليلات اقتصادية ومالية شاملة على شبكة نفود الإخبارية.',
  keywords: 'اقتصاد، أخبار اقتصادية، مال وأعمال، السعودية، رؤية 2030',
};

async function getEconomyNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('category', 'economy')
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error('Error fetching economy news:', error);
    return [];
  }

  return data || [];
}

export default async function EconomyPage() {
  const news = await getEconomyNews();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />
      
      <header className="bg-primary text-primary-foreground py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="text-gold" size={48} aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold">أخبار الاقتصاد</h1>
          </div>
          <p className="text-xl text-gold">آخر الأخبار الاقتصادية والمالية من المملكة والعالم</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <section aria-label="قائمة الأخبار الاقتصادية">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار اقتصادية متاحة حالياً</p>
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
