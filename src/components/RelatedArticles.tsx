import Link from 'next/link';
import Image from 'next/image';
import { News } from '@/types/news';
import { getCategoryLabel } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface RelatedArticlesProps {
  articles: News[];
  currentArticleId: string;
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000 / 60);
  if (diff < 60) return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
  return `منذ ${Math.floor(diff / 1440)} يوم`;
}

export default function RelatedArticles({ articles, currentArticleId }: RelatedArticlesProps) {
  const filteredArticles = articles.filter(article => article.id !== currentArticleId);

  if (filteredArticles.length === 0) return null;

  return (
    <aside className="mt-16 pt-8 border-t-2 border-gold" role="complementary" aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading" className="text-2xl font-bold mb-6">أخبار ذات صلة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((news) => (
          <article key={news.id} className="group">
            <Link href={`/article/${news.slug || news.id}`} className="block">
              <div className="flex gap-4 p-4 border border-border rounded-lg hover:border-gold hover:shadow-lg transition-all duration-300">
                {news.image_url && (
                  <div className="relative w-24 h-24 shrink-0">
                    <Image
                      src={news.image_url}
                      alt={news.title}
                      fill
                      className="object-cover rounded-md"
                      quality={75}
                      loading="lazy"
                      sizes="96px"
                      unoptimized={news.image_url.includes('twimg.com')}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-bold text-gold mb-1">
                    {getCategoryLabel(news.category)}
                  </span>
                  <h3 className="font-bold group-hover:text-gold transition-colors line-clamp-2 mb-2">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} aria-hidden="true" />
                    <time dateTime={news.created_at}>
                      {getTimeAgo(news.created_at)}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </aside>
  );
}
