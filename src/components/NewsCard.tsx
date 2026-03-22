import Link from 'next/link';
import Image from 'next/image';
import { News } from '@/types/news';
import { getCategoryLabel } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft } from 'lucide-react';

interface NewsCardProps {
  news: News;
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000 / 60);
  if (diff < 60) return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
  return `منذ ${Math.floor(diff / 1440)} يوم`;
}

export default function NewsCard({ news }: NewsCardProps) {
  const articleUrl = `/article/${news.slug || news.id}`;
  const categoryLabel = getCategoryLabel(news.category);

  return (
    <Card className="overflow-hidden shadow-elegant hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-0 bg-card h-full flex flex-col rounded-2xl group">
      <Link href={articleUrl} aria-label={`اقرأ المزيد عن: ${news.title}`}>
        <figure className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={80}
              loading="lazy"
              unoptimized={news.image_url.includes('twimg.com')}
            />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" aria-hidden="true"></div>
          <figcaption className="absolute top-4 right-4 bg-gradient-to-r from-gold-dark to-gold text-accent-foreground px-4 py-1.5 rounded-xl text-sm font-black shadow-lg backdrop-blur-md">
            {categoryLabel}
          </figcaption>
        </figure>
      </Link>
      <CardHeader className="pb-3 pt-5 px-5">
        <h3 className="text-xl font-black leading-snug">
          <Link href={articleUrl} className="hover-gold transition-colors line-clamp-2 block drop-shadow-sm">
            {news.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent className="flex-1 pb-3 px-5">
        {news.excerpt && (
          <p className="text-muted-foreground line-clamp-3 leading-relaxed text-base font-medium">{news.excerpt}</p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 pb-5 px-5 border-t border-border/40 bg-secondary/20">
        <div className="flex flex-col gap-1.5">
          {news.editors && (
            <span className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs">✍️</span>
              {news.editors.name}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Calendar size={14} className="text-gold-dark" aria-hidden="true" />
            <time>{getTimeAgo(news.created_at)}</time>
          </div>
        </div>
        <Link href={articleUrl}>
          <Button variant="ghost" size="sm" className="hover-gold group/btn font-bold bg-white/5 hover:bg-gold/10 rounded-xl" aria-label={`اقرأ المقال: ${news.title}`}>
            اقرأ المزيد
            <ChevronLeft size={16} className="mr-1 transition-transform group-hover/btn:-translate-x-1" aria-hidden="true" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
