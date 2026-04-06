import Link from 'next/link';
import { LiveEvent } from '@/types/news';
import { getCategoryLabel, formatTimeAgo } from '@/lib/utils';
import { Radio, Clock, MessageSquare } from 'lucide-react';
import NewsImage from '@/components/NewsImage';

interface LiveEventCardProps {
  event: LiveEvent;
}


export default function LiveEventCard({ event }: LiveEventCardProps) {
  const isActive = event.status === 'active';
  const isEnded = event.status === 'ended';
  const isArchived = event.status === 'archived';

  return (
    <Link href={`/live/${event.id}`} className="block group">
      <article className={`bg-card rounded-2xl border border-border/50 overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-300 hover:border-gold/30 ${isArchived ? 'opacity-60 grayscale-[30%]' : ''}`}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <NewsImage
            src={event.main_image_url}
            alt={event.title}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            category={getCategoryLabel(event.category)}
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isActive && (
              <span className="bg-red-500 text-white animate-pulse flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                تغطية حية
              </span>
            )}
            {isEnded && (
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
                انتهت التغطية
              </span>
            )}
            {isArchived && (
              <span className="bg-muted/80 text-muted-foreground border border-border px-3 py-1 rounded-full text-sm font-medium">
                مؤرشفة
              </span>
            )}
          </div>
          
          {/* Category Badge */}
          <div className="absolute bottom-4 right-4">
            <span className="bg-background/80 backdrop-blur-sm border border-border px-3 py-1 rounded-full text-sm font-medium">
              {getCategoryLabel(event.category)}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-gold transition-colors">
            {event.title}
          </h3>
          
          {event.summary && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {event.summary}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{event.updates_count || 0} تحديث</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatTimeAgo(event.updated_at)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
