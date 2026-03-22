import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { LiveEvent } from '@/types/news';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import { SITE_URL } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Radio, Clock } from 'lucide-react';
import LiveEventUpdates from '@/components/LiveEventUpdates';

export const revalidate = 30;

interface LiveEventUpdateData {
  id: string;
  content: string;
  created_at: string;
  is_breaking?: boolean;
  media_url?: string | null;
  source_news_id: string | null;
  live_event_id: string;
}

async function getLiveEvent(id: string): Promise<LiveEvent | null> {
  const { data: event, error: eventError } = await supabase
    .from('live_events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    console.error('Error fetching live event:', eventError);
    return null;
  }

  return event;
}

async function getLiveEventUpdates(eventId: string): Promise<LiveEventUpdateData[]> {
  const { data, error } = await supabase
    .from('live_event_updates')
    .select('*')
    .eq('live_event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching live event updates:', error);
    return [];
  }

  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getLiveEvent(id);

  if (!event) {
    return {
      title: 'الحدث غير موجود',
    };
  }

  return {
    title: `${event.title} - تغطية مباشرة`,
    description: event.summary || event.title,
    keywords: `حدث مباشر، ${getCategoryLabel(event.category)}، تغطية حية`,
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/live/${event.id}`,
      title: event.title,
      description: event.summary || event.title,
      images: event.main_image_url ? [{ url: event.main_image_url }] : [],
    },
  };
}

export default async function LiveEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, updates] = await Promise.all([
    getLiveEvent(id),
    getLiveEventUpdates(id)
  ]);

  if (!event) {
    notFound();
  }

  const isActive = event.status === 'active';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-card rounded-2xl shadow-elegant border border-border overflow-hidden">
          {event.main_image_url && (
            <div className="relative w-full h-[400px]">
              <Image
                src={event.main_image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              {isActive && (
                <div className="absolute top-6 right-6 bg-red-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 font-bold shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span>مباشر الآن</span>
                </div>
              )}
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="mb-8">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold border border-primary/20">
                {getCategoryLabel(event.category)}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-[1.3] text-foreground">
              {event.title}
            </h1>

            {event.summary && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed font-medium">
                {event.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-10 pb-8 border-b-2 border-border/50">
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-bold">آخر تحديث: {formatDate(event.updated_at)}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl">
                <Radio className={`w-5 h-5 ${isActive ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                <span className="font-bold">{updates.length} تحديث</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <span className="w-2 h-8 bg-gold rounded-full inline-block"></span>
                  التحديثات المباشرة
                </h2>
                {isActive && (
                  <span className="text-sm font-bold text-red-500 animate-pulse flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    يتم التحديث تلقائياً
                  </span>
                )}
              </div>
              
              <LiveEventUpdates 
                initialUpdates={updates} 
                eventId={event.id} 
                isActive={isActive} 
              />
            </div>

            {!isActive && (
              <div className="mt-12 p-6 bg-secondary/50 border border-border rounded-xl text-center shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-2">انتهت التغطية</h3>
                <p className="text-muted-foreground font-medium">شكراً لمتابعتكم التغطية المباشرة لهذا الحدث عبر نفود الإخبارية.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
