'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FaqItem } from '@/lib/schema';

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mb-10 md:mb-16" aria-labelledby="faq-heading">
      <header className="flex items-center mb-6 md:mb-12">
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <div className="p-2 bg-gold/10 rounded-full">
            <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-gold" aria-hidden="true" />
          </div>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            الأسئلة الشائعة
          </h2>
          <div className="h-1.5 flex-1 bg-gradient-to-r from-gold/50 to-transparent rounded-full" aria-hidden="true"></div>
        </div>
      </header>

      <div className="space-y-3 md:space-y-4">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className="bg-card rounded-xl md:rounded-2xl border border-border/50 overflow-hidden shadow-elegant transition-all duration-300"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex items-center justify-between gap-4 p-4 md:p-6 text-right transition-colors hover:bg-secondary/50"
                >
                  <span className="text-base md:text-lg font-bold text-foreground">{item.question}</span>
                  <ChevronDown
                    className={`shrink-0 text-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    size={22}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={`faq-answer-${index}`}
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 md:px-6 pb-4 md:pb-6 text-sm md:text-base leading-loose text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
