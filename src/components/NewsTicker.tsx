'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NewsItem {
  id: string;
  text: string;
}

interface Props {
  limit?: number;
  speedPxPerSec?: number;
  label?: string;
  refreshMs?: number;
}

function sanitizeText(s: string): string {
  return (s || '')
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

export default function NewsTicker({
  limit = 15,
  speedPxPerSec = 80,
  label = 'عاجل',
  refreshMs = 60_000,
}: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let stop = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, excerpt')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const normalized: NewsItem[] = (data || []).map((news: any) => ({
          id: news.id,
          text: sanitizeText(news.excerpt || news.title || ''),
        }));

        const filtered = normalized.filter((n) => !!n.text);

        if (!stop && filtered.length > 0) {
          setItems(filtered);
          setLoading(false);
          setErr('');
        } else if (!stop && filtered.length === 0) {
          setLoading(false);
        }
      } catch (e: any) {
        console.error('خطأ في جلب الأخبار:', e);
        if (!stop && items.length === 0) {
          setErr('تعذّر جلب الأخبار');
          setLoading(false);
        }
      }
    };

    load();
    const iv = setInterval(load, refreshMs);

    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [limit, refreshMs]);

  const allNewsText = useMemo(() => {
    if (!items.length) return '';
    return items.map((item) => item.text).filter(Boolean).join(' • ');
  }, [items]);

  const scrollDuration = useMemo(() => {
    if (!allNewsText) return 60;
    const estimatedWidth = allNewsText.length * 12;
    return estimatedWidth / speedPxPerSec;
  }, [allNewsText, speedPxPerSec]);

  if (err) {
    return (
      <div dir="rtl" className="bg-red-50 text-red-700 p-3 text-center text-sm rounded">
        {err}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="bg-primary border-y-2 border-gold py-3 overflow-hidden select-none"
      ref={wrapperRef}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="bg-accent text-accent-foreground px-4 py-1 rounded-md font-bold whitespace-nowrap text-sm">
            {label}
          </div>

          <div className="flex-1 overflow-hidden relative" dir="ltr">
            {loading ? (
              <div className="h-5 rounded bg-white/10 animate-pulse" />
            ) : allNewsText ? (
              <div
                className="ticker-scroll"
                style={{
                  ['--scroll-duration' as string]: `${scrollDuration}s`,
                }}
              >
                <span className="ticker-text" dir="rtl">
                  {allNewsText} • {allNewsText}
                </span>
              </div>
            ) : (
              <div className="text-gold/90 text-sm">لا توجد أخبار حالياً</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-scroll {
          display: inline-block;
          white-space: nowrap;
          animation: scroll-rtl var(--scroll-duration, 60s) linear infinite;
        }
        .ticker-text {
          font-size: 0.9rem;
          line-height: 1.5;
          color: hsl(var(--gold));
          font-weight: 500;
          white-space: nowrap;
          display: inline-block;
          unicode-bidi: plaintext;
        }
        @keyframes scroll-rtl {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
