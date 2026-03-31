import Link from 'next/link';
import { Newspaper, Radio, ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase';

async function getStats() {
  const [{ count: newsCount }, { count: liveEventsCount }] = await Promise.all([
    supabaseServer.from('news').select('*', { count: 'exact', head: true }),
    supabaseServer.from('live_events').select('*', { count: 'exact', head: true }),
  ]);

  return {
    newsCount: newsCount ?? 0,
    liveEventsCount: liveEventsCount ?? 0,
  };
}

export default async function DashboardHomePage() {
  const stats = await getStats();

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="mt-2 text-muted-foreground">اختر القسم الذي تريد إدارته.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard-control-panel-2025/news" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-gold/50 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأخبار</p>
              <h3 className="mt-2 text-3xl font-bold text-foreground">{stats.newsCount}</h3>
              <p className="mt-4 text-foreground font-medium">إدارة الأخبار</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-gold">
              <Newspaper size={28} />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gold font-medium">
            <span>فتح القسم</span>
            <ArrowLeft size={16} />
          </div>
        </Link>

        <Link href="/dashboard-control-panel-2025/live-events" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-gold/50 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأحداث الحية</p>
              <h3 className="mt-2 text-3xl font-bold text-foreground">{stats.liveEventsCount}</h3>
              <p className="mt-4 text-foreground font-medium">الأحداث الحية</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-destructive">
              <Radio size={28} />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gold font-medium">
            <span>فتح القسم</span>
            <ArrowLeft size={16} />
          </div>
        </Link>
      </div>
    </section>
  );
}
