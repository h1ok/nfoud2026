'use client';

import { useMemo, useState } from 'react';
import { BarChart3, CalendarRange, ChartColumn, FolderKanban, Newspaper, TrendingUp } from 'lucide-react';

type MonthlyBucket = {
  key: string;
  label: string;
  count: number;
};

type StatisticsProps = {
  totalNews: number;
  currentMonthCount: number;
  previousMonthCount: number;
  growthRate: number;
  averagePerMonth: number;
  topCategory: string;
  categoriesCount: number;
  monthsWithContent: number;
  maxCount: number;
  monthlyStats: MonthlyBucket[];
};

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
}

export default function NewsStatisticsDashboard(stats: StatisticsProps) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(stats.monthlyStats[stats.monthlyStats.length - 1]?.key ?? '');

  const selectedMonth = useMemo(() => {
    return stats.monthlyStats.find((item) => item.key === selectedMonthKey) ?? stats.monthlyStats[stats.monthlyStats.length - 1] ?? null;
  }, [selectedMonthKey, stats.monthlyStats]);

  const previousSelectedMonth = useMemo(() => {
    if (!selectedMonth) return null;
    const selectedIndex = stats.monthlyStats.findIndex((item) => item.key === selectedMonth.key);
    if (selectedIndex <= 0) return null;
    return stats.monthlyStats[selectedIndex - 1] ?? null;
  }, [selectedMonth, stats.monthlyStats]);

  const selectedMonthGrowth = useMemo(() => {
    if (!selectedMonth) return 0;
    if (!previousSelectedMonth) return selectedMonth.count > 0 ? 100 : 0;
    if (previousSelectedMonth.count === 0) return selectedMonth.count > 0 ? 100 : 0;
    return ((selectedMonth.count - previousSelectedMonth.count) / previousSelectedMonth.count) * 100;
  }, [previousSelectedMonth, selectedMonth]);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">إحصائيات الأخبار</h2>
        <p className="mt-2 text-muted-foreground">متابعة أداء النشر الشهري ومؤشرات النمو داخل لوحة التحكم.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">اختيار الشهر</h3>
            <p className="mt-1 text-sm text-muted-foreground">اختر أي شهر من جميع الأشهر المتاحة لمعرفة عدد الأخبار المنشورة خلاله.</p>
          </div>
          <div className="w-full md:max-w-xs">
            <label className="mb-2 block text-sm font-medium text-foreground">الشهر</label>
            <select
              value={selectedMonthKey}
              onChange={(event) => setSelectedMonthKey(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold"
            >
              {stats.monthlyStats.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأخبار</p>
              <div className="mt-2 text-3xl font-bold text-foreground">{stats.totalNews}</div>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-primary">
              <Newspaper size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">أخبار الشهر المختار</p>
              <div className="mt-2 text-3xl font-bold text-foreground">{selectedMonth?.count ?? 0}</div>
              <p className="mt-2 text-xs text-muted-foreground">{selectedMonth?.label ?? 'لا يوجد شهر محدد'}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-gold">
              <CalendarRange size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">نمو الشهر المختار</p>
              <div className={`mt-2 text-3xl font-bold ${selectedMonthGrowth >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatPercentage(selectedMonthGrowth)}</div>
              <p className="mt-2 text-xs text-muted-foreground">مقارنة بالشهر السابق</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">أكثر قسم نشاطًا</p>
              <div className="mt-2 text-xl font-bold text-foreground">{stats.topCategory}</div>
              <p className="mt-2 text-xs text-muted-foreground">عدد الأقسام المستخدمة: {stats.categoriesCount}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-primary">
              <FolderKanban size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">النشر الشهري لكل الأشهر</h3>
              <p className="mt-1 text-sm text-muted-foreground">تم تجميع الأخبار المنشورة شهريًا من كامل البيانات المتاحة.</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-gold">
              <BarChart3 size={22} />
            </div>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max items-end gap-3 rounded-2xl border border-border bg-background/40 p-4">
              {stats.monthlyStats.map((item) => {
                const isSelected = item.key === selectedMonth?.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedMonthKey(item.key)}
                    className="flex w-24 shrink-0 flex-col items-center justify-end gap-3 text-center"
                  >
                    <div className={`text-xs font-bold transition ${isSelected ? 'text-gold' : 'text-muted-foreground'}`}>
                      {item.count}
                    </div>
                    <div className="flex h-56 items-end">
                      <div
                        className={`w-14 rounded-t-2xl transition-all ${isSelected ? 'bg-gold' : 'bg-primary/85'}`}
                        style={{ height: `${Math.max((item.count / stats.maxCount) * 180, item.count > 0 ? 14 : 4)}px` }}
                      />
                    </div>
                    <div className={`text-xs font-medium leading-5 transition ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">تفاصيل الشهر المختار</h3>
              <p className="mt-1 text-sm text-muted-foreground">ملخص مباشر حسب الشهر الذي تختاره.</p>
            </div>
            <div className="rounded-2xl bg-secondary p-3 text-primary">
              <ChartColumn size={22} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm text-muted-foreground">الشهر المحدد</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{selectedMonth?.label ?? '-'}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm text-muted-foreground">عدد الأخبار المنشورة</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{selectedMonth?.count ?? 0}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm text-muted-foreground">عدد أخبار الشهر السابق</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{previousSelectedMonth?.count ?? 0}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm text-muted-foreground">متوسط النشر الشهري</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{stats.averagePerMonth.toFixed(1)}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm text-muted-foreground">أشهر فيها نشر خلال آخر 6 أشهر</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{stats.monthsWithContent}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
