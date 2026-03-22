import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { LiveEvent } from '@/types/news';
import LiveEventCard from '@/components/LiveEventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Radio } from 'lucide-react';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'الأحداث الحية',
  description: 'تابع الأحداث الحية والتغطيات المباشرة للأخبار العاجلة',
  keywords: 'أحداث حية، تغطية مباشرة، أخبار عاجلة',
};

async function getLiveEvents(): Promise<LiveEvent[]> {
  const { data, error } = await supabase
    .from('live_events')
    .select('*')
    .order('status', { ascending: true }) // active first
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching live events:', error);
    return [];
  }

  return data?.map(event => ({
    ...event,
    updates_count: event.live_event_updates?.[0]?.count || 0
  })) || [];
}

export default async function LiveEventsPage() {
  const events = await getLiveEvents();
  const activeEvents = events.filter(e => e.status === 'active');
  const endedEvents = events.filter(e => e.status === 'ended');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Radio className="w-8 h-8 text-red-600 animate-pulse" />
          <h1 className="text-3xl font-bold">الأحداث الحية</h1>
        </div>

        {activeEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              مباشر الآن
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {endedEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">أحداث منتهية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">لا توجد أحداث حية حالياً</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
