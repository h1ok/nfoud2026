'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface LiveEventUpdate {
  id: string;
  content: string;
  created_at: string;
  is_breaking?: boolean;
  media_url?: string | null;
  source_news_id: string | null;
  live_event_id: string;
}

interface LiveEventUpdatesProps {
  initialUpdates: LiveEventUpdate[];
  eventId: string;
  isActive: boolean;
}

export default function LiveEventUpdates({ initialUpdates, eventId, isActive }: LiveEventUpdatesProps) {
  const [updates, setUpdates] = useState<LiveEventUpdate[]>(initialUpdates);

  useEffect(() => {
    if (!isActive) return;

    // Subscribe to new updates for this specific live event
    const channel = supabase
      .channel(`live_event_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_event_updates',
          filter: `live_event_id=eq.${eventId}`
        },
        (payload) => {
          const newUpdate = payload.new as LiveEventUpdate;
          setUpdates((currentUpdates) => [newUpdate, ...currentUpdates]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, isActive]);

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/20 rounded-xl border border-border/50">
        <p className="text-muted-foreground font-medium text-lg">لا توجد تحديثات حتى الآن</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update, index) => (
        <div 
          key={update.id}
          className={`border-r-[6px] pr-6 py-6 transition-all duration-500 hover:shadow-md ${
            index === 0 && isActive
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/10'
              : 'border-gold/50 bg-secondary/30'
          } rounded-xl`}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg shadow-sm border border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-bold">{formatDate(update.created_at)}</span>
            </div>
            {index === 0 && isActive && (
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm animate-pulse">
                جديد
              </span>
            )}
            {update.is_breaking && (
              <span className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">
                عاجل
              </span>
            )}
          </div>
          <div 
            className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground/90 font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: update.content }}
          />
          {update.media_url && (
            <div className="mt-5 relative w-full h-72 sm:h-96 rounded-xl overflow-hidden shadow-md border border-border/50">
              <Image 
                src={update.media_url} 
                alt="مرفق التحديث" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
                unoptimized={update.media_url.includes('twimg.com')}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
