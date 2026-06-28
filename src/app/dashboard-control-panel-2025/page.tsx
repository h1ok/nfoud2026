import { Suspense } from 'react';
import Link from 'next/link';
import { Newspaper, Radio, ArrowLeft, ChartColumn, CalendarClock } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase';

async function getStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: newsCount }, { count: liveEventsCount }, { data: latestNews }, { count: newsLast7Days }] = await Promise.all([
    supabaseServer.from('news').select('*', { count: 'exact', head: true }),
    supabaseServer.from('live_events').select('*', { count: 'exact', head: true }),
    supabaseServer.from('news').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseServer.from('news').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
  ]);

  return {
    newsCount: newsCount ?? 0,
    liveEventsCount: liveEventsCount ?? 0,
    latestNewsDate: latestNews?.created_at ?? null,
    newsLast7Days: newsLast7Days ?? 0,
  };
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-9 w-16 rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-muted" />
          </div>
          <div className="mt-6 h-4 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

async function StatsCards() {
  const stats = await getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      <Link href="/dashboard-control-panel-2025/statistics" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-gold/50 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">آخر تحديث إحصائي</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{stats.newsCount}</h3>
            <p className="mt-4 text-foreground font-medium">إحصائيات الأخبار</p>
            <p className="mt-2 text-xs text-muted-foreground">{stats.latestNewsDate ? new Date(stats.latestNewsDate).toLocaleDateString('ar-SA') : 'لا توجد بيانات كافية'}</p>
          </div>
          <div className="rounded-2xl bg-secondary p-3 text-primary">
            <ChartColumn size={28} />
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-gold font-medium">
          <span>عرض الإحصائيات</span>
          <ArrowLeft size={16} />
        </div>
      </Link>

      <Link href="/dashboard-control-panel-2025/news" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-gold/50 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">المقالات خلال 7 أيام</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{stats.newsLast7Days}</h3>
            <p className="mt-4 text-foreground font-medium">النشاط الأسبوعي</p>
          </div>
          <div className="rounded-2xl bg-secondary p-3 text-gold">
            <CalendarClock size={28} />
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-gold font-medium">
          <span>عرض الأخبار</span>
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
  );
}

export default function DashboardHomePage() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="mt-2 text-muted-foreground">اختر القسم الذي تريد إدارته.</p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
    </section>
  );
}
