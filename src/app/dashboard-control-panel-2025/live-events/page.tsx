import Link from 'next/link';
import { Radio, ArrowLeft, Clock3 } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase';

interface AdminLiveEvent {
  id: string;
  title: string;
  summary: string | null;
  status: 'active' | 'ended' | 'archived';
  updated_at: string;
}

async function getLiveEvents(): Promise<AdminLiveEvent[]> {
  const { data, error } = await supabaseServer
    .from('live_events')
    .select('id, title, summary, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch live events for dashboard:', error);
    return [];
  }

  return (data as AdminLiveEvent[]) ?? [];
}

function getStatusLabel(status: AdminLiveEvent['status']) {
  if (status === 'active') return 'نشط';
  if (status === 'ended') return 'منتهي';
  return 'مؤرشف';
}

export default async function DashboardLiveEventsPage() {
  const liveEvents = await getLiveEvents();

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">الأحداث الحية</h2>
        <p className="mt-2 text-muted-foreground">عرض ومتابعة التغطيات الحية الموجودة في النظام.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {liveEvents.map((event) => (
          <article key={event.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{event.summary || 'لا يوجد وصف لهذا الحدث.'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">{getStatusLabel(event.status)}</span>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 size={14} />
                  <span>{new Date(event.updated_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <Link href={`/live/${event.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline">
                  <span>فتح الحدث</span>
                  <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}

        {liveEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            لا توجد أحداث حية حالياً.
          </div>
        )}
      </div>
    </section>
  );
}
