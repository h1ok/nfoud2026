export const dynamic = 'force-dynamic';

import { supabaseServer } from '@/lib/supabase';
import NewsStatisticsDashboard from '@/components/NewsStatisticsDashboard';

const DASHBOARD_TIME_ZONE = 'Asia/Riyadh';
const STATS_BATCH_SIZE = 1000;

type NewsRecord = {
  id: string;
  created_at: string;
  category: string | null;
};

type MonthlyBucket = {
  key: string;
  label: string;
  count: number;
};

function getTimeZoneYearMonthParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DASHBOARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '1');

  return { year, month };
}

function shiftYearMonth(year: number, month: number, offset: number) {
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
  };
}

function getMonthKeyFromParts(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getMonthKey(date: Date) {
  const { year, month } = getTimeZoneYearMonthParts(date);
  return getMonthKeyFromParts(year, month);
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('ar-SA', { timeZone: DASHBOARD_TIME_ZONE, month: 'long', year: 'numeric' }).format(date);
}

function createLastMonths(count: number) {
  const months: MonthlyBucket[] = [];
  const now = new Date();
  const currentParts = getTimeZoneYearMonthParts(now);

  for (let index = count - 1; index >= 0; index -= 1) {
    const monthParts = shiftYearMonth(currentParts.year, currentParts.month, -index);
    const date = new Date(Date.UTC(monthParts.year, monthParts.month - 1, 1));
    months.push({
      key: getMonthKeyFromParts(monthParts.year, monthParts.month),
      label: getMonthLabel(date),
      count: 0,
    });
  }

  return months;
}

function createMonthsBetween(startKey: string, endKey: string) {
  const [startYear, startMonth] = startKey.split('-').map(Number);
  const [endYear, endMonth] = endKey.split('-').map(Number);
  const months: MonthlyBucket[] = [];

  let currentYear = startYear;
  let currentMonth = startMonth;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const date = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    months.push({
      key: getMonthKeyFromParts(currentYear, currentMonth),
      label: getMonthLabel(date),
      count: 0,
    });

    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  return months;
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
}

async function getStatistics() {
  const { count: totalNewsCount, error: totalNewsCountError } = await supabaseServer
    .from('news')
    .select('*', { count: 'exact', head: true });

  if (totalNewsCountError) {
    console.error('Dashboard statistics count failed:', totalNewsCountError);
    return {
      totalNews: 0,
      currentMonthCount: 0,
      previousMonthCount: 0,
      growthRate: 0,
      averagePerMonth: 0,
      topCategory: 'غير محدد',
      categoriesCount: 0,
      monthsWithContent: 0,
      maxCount: 1,
      monthlyStats: createLastMonths(6),
    };
  }

  const totalNews = totalNewsCount ?? 0;
  const records: NewsRecord[] = [];

  for (let from = 0; from < totalNews; from += STATS_BATCH_SIZE) {
    const to = Math.min(from + STATS_BATCH_SIZE - 1, totalNews - 1);
    const { data, error } = await supabaseServer
      .from('news')
      .select('id, created_at, category')
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Dashboard statistics fetch failed:', error);
      return {
        totalNews: 0,
        currentMonthCount: 0,
        previousMonthCount: 0,
        growthRate: 0,
        averagePerMonth: 0,
        topCategory: 'غير محدد',
        categoriesCount: 0,
        monthsWithContent: 0,
        maxCount: 1,
        monthlyStats: createLastMonths(6),
      };
    }

    records.push(...((data ?? []) as NewsRecord[]));
  }

  const firstRecordDate = records[0] ? new Date(records[0].created_at) : null;
  const lastRecordDate = records[records.length - 1] ? new Date(records[records.length - 1].created_at) : null;
  const monthlyStats = firstRecordDate && lastRecordDate
    ? createMonthsBetween(getMonthKey(firstRecordDate), getMonthKey(lastRecordDate))
    : createLastMonths(6);
  const monthlyLookup = new Map(monthlyStats.map((item) => [item.key, item]));
  const categoryCounts = new Map<string, number>();

  for (const record of records) {
    const createdAt = new Date(record.created_at);
    const monthKey = getMonthKey(createdAt);
    const existingMonth = monthlyLookup.get(monthKey);

    if (existingMonth) {
      existingMonth.count += 1;
    }

    const normalizedCategory = record.category?.trim() || 'غير مصنف';
    categoryCounts.set(normalizedCategory, (categoryCounts.get(normalizedCategory) ?? 0) + 1);
  }

  const currentMonth = monthlyStats[monthlyStats.length - 1]?.count ?? 0;
  const previousMonth = monthlyStats[monthlyStats.length - 2]?.count ?? 0;
  const growthRate = previousMonth === 0 ? (currentMonth > 0 ? 100 : 0) : ((currentMonth - previousMonth) / previousMonth) * 100;
  const monthsWithContent = monthlyStats.filter((item) => item.count > 0).length;
  const averagePerMonth = monthlyStats.length > 0 ? totalNews / monthlyStats.length : 0;
  const topCategoryEntry = [...categoryCounts.entries()].sort((left, right) => right[1] - left[1])[0];
  const maxCount = Math.max(...monthlyStats.map((item) => item.count), 1);

  return {
    totalNews,
    currentMonthCount: currentMonth,
    previousMonthCount: previousMonth,
    growthRate,
    averagePerMonth,
    topCategory: topCategoryEntry?.[0] ?? 'غير محدد',
    categoriesCount: categoryCounts.size,
    monthsWithContent,
    maxCount,
    monthlyStats,
  };
}

export default async function DashboardStatisticsPage() {
  const stats = await getStatistics();

  return <NewsStatisticsDashboard {...stats} />;
}
