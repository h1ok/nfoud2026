'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LiveEventKeywordsFieldProps {
  inputId: string;
  inputName: string;
  titleInputId: string;
  summaryInputId: string;
  defaultValue?: string;
  placeholder?: string;
}

export function LiveEventKeywordsField({
  inputId,
  inputName,
  titleInputId,
  summaryInputId,
  defaultValue = '',
  placeholder,
}: LiveEventKeywordsFieldProps) {
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async () => {
    const title = (document.getElementById(titleInputId) as HTMLInputElement | null)?.value?.trim() || '';
    const summary = (document.getElementById(summaryInputId) as HTMLTextAreaElement | null)?.value?.trim() || '';

    if (!title) {
      setError('أدخل عنوان الحدث أولاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary }),
      });

      const data = await res.json();

      if (!res.ok || data.error || !Array.isArray(data.keywords)) {
        setError('فشل توليد الكلمات المفتاحية');
        return;
      }

      setValue(data.keywords.join(', '));
    } catch {
      setError('حدث خطأ أثناء التوليد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">الكلمات المفتاحية</span>
      </div>
      {!mounted ? (
        <>
          <input
            id={inputId}
            type="text"
            name={inputName}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
          />
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white opacity-70 sm:w-auto"
          >
            <Sparkles size={15} />
            توليد الكلمات المفتاحية بالذكاء الاصطناعي
          </button>
        </>
      ) : (
        <>
          <input
            id={inputId}
            type="text"
            name={inputName}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
          />

          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60 sm:w-auto"
            >
              <Sparkles size={15} />
              {loading ? 'جاري توليد الكلمات المفتاحية…' : 'توليد الكلمات المفتاحية بالذكاء الاصطناعي'}
            </button>
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
          </div>
        </>
      )}
    </div>
  );
}
