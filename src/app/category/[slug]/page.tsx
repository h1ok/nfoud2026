import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import { News } from '@/types/news';
import NewsCard from '@/components/NewsCard';
import NewsTickerWrapper from '@/components/NewsTickerWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/constants';
import { getCategories, getCategoryBySlug } from '@/lib/categories';
import { Newspaper } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

// Pre-render dynamic categories (non-static ones get their page here).
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories
    .filter((c) => !['politics', 'economy', 'local', 'sports'].includes(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'القسم غير موجود', robots: { index: false, follow: false } };
  }

  const url = `${SITE_URL}/category/${category.slug}`;
  const title = `أخبار ${category.name} | ${SITE_NAME}`;
  const description = category.description || `تابع آخر أخبار ${category.name} على شبكة نفود الإخبارية.`;

  return {
    title: `أخبار ${category.name}`,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
    },
  };
}

async function getCategoryNews(slug: string): Promise<News[]> {
  const { data, error } = await supabaseServer
    .from('news')
    .select('*, editors(name)')
    .eq('category', slug)
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error('Error fetching category news:', error);
    return [];
  }

  return data || [];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const news = await getCategoryNews(category.slug);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <NewsTickerWrapper />

      <div className="bg-secondary/50 border-b border-border">
        <Breadcrumbs items={[{ label: category.name, href: `/category/${category.slug}` }]} />
      </div>

      <header className="bg-primary text-primary-foreground py-10 md:py-16 border-b-2 border-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="text-gold" size={36} aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">أخبار {category.name}</h1>
          </div>
          <p className="text-base md:text-xl text-gold">
            {category.description || `آخر أخبار ${category.name}`}
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <section aria-label={`قائمة أخبار ${category.name}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {news.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-xl text-muted-foreground">لا توجد أخبار في هذا القسم حالياً</p>
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
