import Link from 'next/link';
import { Radio, ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase';
import { LiveEvent } from '@/types/news';

async function getActiveLiveCoverages(): Promise<LiveEvent[]> {
  const { data, error } = await supabaseServer
    .from('live_events')
    .select('*')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching live coverages:', error);
    return [];
  }

  return data || [];
}

export default async function LiveCoveragesSection() {
  const coverages = await getActiveLiveCoverages();

  if (coverages.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-6 md:p-8 border-2 border-destructive/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="text-destructive animate-pulse w-8 h-8" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">التغطيات الحية</h2>
        </div>
        <Link 
          href="/live" 
          className="flex items-center gap-2 text-destructive hover:text-destructive/80 font-semibold transition-colors"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coverages.map((coverage) => (
          <Link
            key={coverage.id}
            href={`/live/${coverage.id}`}
            className="group bg-background border-2 border-border hover:border-destructive rounded-xl p-5 transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse mt-1 shrink-0"></div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-destructive transition-colors line-clamp-2">
                {coverage.title}
              </h3>
            </div>
            {coverage.summary && (
              <p className="text-muted-foreground text-sm line-clamp-2 pr-6">
                {coverage.summary}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-destructive font-semibold pr-6">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>مباشر الآن</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
