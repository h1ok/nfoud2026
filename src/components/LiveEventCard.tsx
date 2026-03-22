import Link from 'next/link';
import Image from 'next/image';
import { LiveEvent } from '@/types/news';
import { getCategoryLabel } from '@/lib/utils';
import { Radio, Clock, MessageSquare } from 'lucide-react';

interface LiveEventCardProps {
  event: LiveEvent;
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000 / 60);
  if (diff < 60) return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
  return `منذ ${Math.floor(diff / 1440)} يوم`;
}

export default function LiveEventCard({ event }: LiveEventCardProps) {
  const isActive = event.status === 'active';
  const isEnded = event.status === 'ended';
  const isArchived = event.status === 'archived';

  return (
    <Link href={`/live/${event.id}`} className="block group">
      <article className={`bg-card rounded-2xl border-0 overflow-hidden shadow-elegant hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${isArchived ? 'opacity-60 grayscale-[30%]' : ''}`}>
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {event.main_image_url ? (
            <Image
              src={event.main_image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={event.main_image_url.includes('twimg.com')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <Radio className="w-20 h-20 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-500" aria-hidden="true"></div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isActive && (
              <span className="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black shadow-lg backdrop-blur-md border border-destructive-foreground/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                تغطية حية
              </span>
            )}
            {isEnded && (
              <span className="bg-secondary/90 backdrop-blur-md text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                انتهت التغطية
              </span>
            )}
            {isArchived && (
              <span className="bg-muted/90 backdrop-blur-md text-muted-foreground border border-border px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                مؤرشفة
              </span>
            )}
          </div>
          
          {/* Category Badge */}
          <div className="absolute bottom-4 right-4">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg">
              {getCategoryLabel(event.category)}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-black mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent transition-all leading-snug">
            {event.title}
          </h3>
          
          {event.summary && (
            <p className="text-muted-foreground text-sm mb-5 line-clamp-2 font-medium leading-relaxed">
              {event.summary}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm font-bold text-muted-foreground pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg">
              <MessageSquare size={14} className="text-primary" />
              <span>{event.updates_count || 0} تحديث</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-primary" />
              <span>{getTimeAgo(event.updated_at)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
