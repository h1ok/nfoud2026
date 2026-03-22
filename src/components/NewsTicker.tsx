'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface NewsItem {
  id: string;
  text: string;
}

interface Props {
  limit?: number;
  charsPerSec?: number;
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
  charsPerSec = 14,
  label = 'عاجل',
  refreshMs = 60_000,
}: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'reading' | 'exit' | 'enter'>('reading');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let stop = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, excerpt')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw new Error(error.message || error.details || error.hint || error.code || 'Unknown Supabase error');
        }

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
        const msg = e?.message || e?.details || JSON.stringify(e) || 'خطأ غير معروف';
        console.error('خطأ في جلب الأخبار:', msg, e);
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

  const validItems = useMemo(() => items.filter((n) => !!n.text), [items]);

  const currentNews = validItems.length > 0 ? validItems[currentIdx % validItems.length] : null;

  const readDuration = currentNews ? Math.max(currentNews.text.length / charsPerSec, 3) : 4;

  const advance = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      setCurrentIdx((prev) => prev + 1);
      setPhase('enter');
      setTimeout(() => {
        setPhase('reading');
      }, 400);
    }, 400);
  }, []);

  useEffect(() => {
    if (phase !== 'reading' || !currentNews) return;

    timerRef.current = setTimeout(() => {
      advance();
    }, readDuration * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentNews, readDuration, advance]);

  if (err) {
    return (
      <div dir="rtl" className="bg-red-50 text-red-700 p-3 text-center text-sm rounded">
        {err}
      </div>
    );
  }

  const currentNum = validItems.length > 0 ? (currentIdx % validItems.length) + 1 : 0;
  const total = validItems.length;

  return (
    <div
      dir="rtl"
      className="bg-primary border-y-2 border-gold overflow-hidden select-none"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 h-11">
          {/* Label */}
          <div className="ticker-label">
            <span className="ticker-dot" />
            {label}
          </div>

          {/* Separator */}
          <div className="ticker-separator" />

          {/* News area */}
          <div className="flex-1 overflow-hidden relative h-7" dir="rtl">
            {loading ? (
              <div className="flex items-center h-full gap-2">
                <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
              </div>
            ) : currentNews ? (
              <div
                key={`${currentNews.id}-${currentIdx}`}
                className={`ticker-item ticker-${phase === 'exit' ? 'exit' : phase === 'enter' ? 'enter' : 'show'}`}
              >
                <span
                  className="ticker-highlight"
                  style={{ ['--dur' as string]: `${readDuration}s` }}
                >
                  {currentNews.text}
                </span>
              </div>
            ) : (
              <div className="flex items-center h-full text-gold/70 text-sm">
                لا توجد أخبار حالياً
              </div>
            )}
          </div>

          {/* Counter + progress */}
          {total > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0" dir="ltr">
              <div className="ticker-progress-track">
                <div
                  className="ticker-progress-bar"
                  key={`prog-${currentIdx}`}
                  style={{ ['--dur' as string]: `${readDuration}s` }}
                />
              </div>
              <span className="ticker-counter">
                {currentNum}/{total}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Label */
        .ticker-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.9rem;
          border-radius: 0.5rem;
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-size: 0.8rem;
          font-weight: 800;
          white-space: nowrap;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .ticker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: hsl(var(--destructive, 0 84% 60%));
          box-shadow: 0 0 6px hsl(var(--destructive, 0 84% 60%) / 0.6);
          animation: dot-blink 1.2s ease-in-out infinite;
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* Separator */
        .ticker-separator {
          width: 1px;
          height: 1.2rem;
          background: hsl(var(--gold) / 0.25);
          flex-shrink: 0;
        }

        /* News item */
        .ticker-item {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          direction: rtl;
          unicode-bidi: plaintext;
        }

        .ticker-show  { animation: t-in 0.4s cubic-bezier(.22,1,.36,1) forwards; }
        .ticker-enter { animation: t-in 0.4s cubic-bezier(.22,1,.36,1) forwards; }
        .ticker-exit  { animation: t-out 0.4s cubic-bezier(.55,0,.67,0.5) forwards; }

        @keyframes t-in {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes t-out {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-110%); opacity: 0; }
        }

        /* Highlight sweep — right to left for Arabic reading */
        .ticker-highlight {
          font-size: 0.88rem;
          font-weight: 600;
          line-height: 1.75rem;
          color: transparent;
          background: linear-gradient(to left, hsl(var(--gold)) 50%, hsl(var(--gold) / 0.35) 50%);
          background-size: 200% 100%;
          background-position: 0% 0%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: sweep var(--dur, 5s) linear forwards;
        }

        @keyframes sweep {
          from { background-position: 0% 0%; }
          to   { background-position: 100% 0%; }
        }

        /* Progress bar */
        .ticker-progress-track {
          width: 3rem;
          height: 3px;
          border-radius: 2px;
          background: hsl(var(--gold) / 0.15);
          overflow: hidden;
        }
        .ticker-progress-bar {
          height: 100%;
          border-radius: 2px;
          background: hsl(var(--gold));
          width: 0%;
          animation: progress var(--dur, 5s) linear forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* Counter */
        .ticker-counter {
          font-size: 0.7rem;
          font-weight: 500;
          color: hsl(var(--gold) / 0.4);
          font-variant-numeric: tabular-nums;
          min-width: 2.5rem;
          text-align: center;
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .ticker-show, .ticker-enter, .ticker-exit {
            animation: none !important;
            transform: translateY(0) !important;
            opacity: 1 !important;
          }
          .ticker-highlight {
            animation: none !important;
            color: hsl(var(--gold)) !important;
            background: none !important;
          }
          .ticker-progress-bar {
            animation: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
