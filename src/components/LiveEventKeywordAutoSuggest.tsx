'use client';

import { useEffect, useRef } from 'react';

interface LiveEventKeywordAutoSuggestProps {
  titleInputId: string;
  summaryInputId: string;
  keywordsInputId: string;
}

export function LiveEventKeywordAutoSuggest({
  titleInputId,
  summaryInputId,
  keywordsInputId,
}: LiveEventKeywordAutoSuggestProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoValueRef = useRef('');

  useEffect(() => {
    const titleInput = document.getElementById(titleInputId) as HTMLInputElement | null;
    const summaryInput = document.getElementById(summaryInputId) as HTMLTextAreaElement | null;
    const keywordsInput = document.getElementById(keywordsInputId) as HTMLInputElement | null;

    if (!titleInput || !keywordsInput) {
      return;
    }

    const generateKeywords = async () => {
      const title = titleInput.value.trim();
      const summary = summaryInput?.value.trim() || '';
      const currentKeywords = keywordsInput.value.trim();

      if (title.length < 6) {
        return;
      }

      if (currentKeywords && currentKeywords !== lastAutoValueRef.current) {
        return;
      }

      try {
        const res = await fetch('/api/generate-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, summary }),
        });

        const data = await res.json();

        if (!res.ok || data.error || !Array.isArray(data.keywords) || data.keywords.length === 0) {
          return;
        }

        const nextValue = data.keywords.join(', ');
        lastAutoValueRef.current = nextValue;
        keywordsInput.value = nextValue;
        keywordsInput.dispatchEvent(new Event('input', { bubbles: true }));
      } catch {
      }
    };

    const scheduleGenerate = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        void generateKeywords();
      }, 900);
    };

    titleInput.addEventListener('input', scheduleGenerate);
    summaryInput?.addEventListener('input', scheduleGenerate);

    return () => {
      titleInput.removeEventListener('input', scheduleGenerate);
      summaryInput?.removeEventListener('input', scheduleGenerate);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keywordsInputId, summaryInputId, titleInputId]);

  return null;
}
