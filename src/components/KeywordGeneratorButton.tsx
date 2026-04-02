'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  titleInputId: string;
  summaryInputId: string;
  keywordsInputId: string;
}

export function KeywordGeneratorButton({ titleInputId, summaryInputId, keywordsInputId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      if (!res.ok || data.error) {
        setError('فشل التوليد، تحقق من مفتاح API');
        return;
      }

      const keywordsInput = document.getElementById(keywordsInputId) as HTMLInputElement | null;
      if (keywordsInput && Array.isArray(data.keywords)) {
        keywordsInput.value = data.keywords.join(', ');
        keywordsInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        <Sparkles size={13} />
        {loading ? 'جاري التوليد…' : 'توليد بالذكاء الاصطناعي'}
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
