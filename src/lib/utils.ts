import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function toRiyadh(d: Date): Date {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000);
}

export function formatDate(date: string | Date): string {
  const d = toRiyadh(new Date(date));
  const day = d.getUTCDate();
  const month = AR_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours().toString().padStart(2, '0');
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

export function formatTimeAgo(date: string | null | undefined): string {
  if (!date) return 'غير محدد';
  try {
    const past = new Date(date);
    if (isNaN(past.getTime()) || past.getFullYear() < 2000) return 'غير محدد';

    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    const diffMin = Math.floor(diffMs / 1000 / 60);

    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 3) return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومين' : 'أيام'}`;

    const r = toRiyadh(past);
    return `${r.getUTCDate()} ${AR_MONTHS[r.getUTCMonth()]} ${r.getUTCFullYear()}`;
  } catch {
    return 'غير محدد';
  }
}

export function safeKeywords(keywords: unknown): string[] {
  if (Array.isArray(keywords)) return keywords.filter((k): k is string => typeof k === 'string');
  if (typeof keywords === 'string') return keywords.split(',').map(k => k.trim()).filter(Boolean);
  return [];
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    politics: 'سياسة',
    economy: 'اقتصاد',
    local: 'محليات',
    sports: 'رياضة',
  };
  return labels[category] || category;
}
