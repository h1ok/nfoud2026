import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Radio, Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

async function getStatistics() {
  const [
    newsStats,
    liveEventsStats,
    newsByCategory,
    recentActivity,
  ] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('live_events').select('*', { count: 'exact' }),
    supabase.from('news').select('category'),
    supabase.from('news').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(10),
  ]);

  const categoryCounts = (newsByCategory.data || []).reduce((acc: any, item: any) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const activeLiveEvents = (liveEventsStats.data || []).filter((e: any) => e.status === 'active').length;
  const endedLiveEvents = (liveEventsStats.data || []).filter((e: any) => e.status === 'ended').length;

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const newsThisMonth = (recentActivity.data || []).filter(
    (n: any) => new Date(n.created_at) >= lastMonth
  ).length;

  return {
    totalNews: newsStats.count || 0,
    totalLiveEvents: liveEventsStats.count || 0,
    activeLiveEvents,
    endedLiveEvents,
    categoryCounts,
    newsThisMonth,
    recentActivity: recentActivity.data || [],
  };
}

const categoryLabels: Record<string, string> = {
  politics: 'سياسة',
  economy: 'اقتصاد',
  local: 'محليات',
  sports: 'رياضة',
  technology: 'تقنية',
  culture: 'ثقافة',
};

export default async function StatisticsPage() {
  const stats = await getStatistics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">الإحصائيات</h1>
        <p className="text-muted-foreground">نظرة شاملة على أداء الموقع</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأخبار</CardTitle>
            <Newspaper className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalNews}</div>
            <p className="text-xs text-muted-foreground mt-1">جميع الأخبار المنشورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أخبار هذا الشهر</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">آخر 30 يوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أحداث حية نشطة</CardTitle>
            <Radio className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeLiveEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">من أصل {stats.totalLiveEvents} حدث</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أحداث منتهية</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.endedLiveEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">تغطيات مكتملة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الأخبار حسب القسم</CardTitle>
            <CardDescription>توزيع الأخبار على الأقسام المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-medium">{categoryLabels[category] || category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(Number(count) / stats.totalNews) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12 text-left">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر 10 أخبار تم نشرها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((news: any) => (
                <div key={news.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">{news.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(news.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded mr-3">
                    {categoryLabels[news.category] || news.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ملخص الأداء</CardTitle>
          <CardDescription>مؤشرات الأداء الرئيسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-accent/50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.newsThisMonth}</div>
              <p className="text-sm text-muted-foreground mt-1">أخبار هذا الشهر</p>
            </div>
            <div className="text-center p-6 bg-accent/50 rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.activeLiveEvents}</div>
              <p className="text-sm text-muted-foreground mt-1">تغطيات حية نشطة</p>
            </div>
            <div className="text-center p-6 bg-accent/50 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
              <p className="text-sm text-muted-foreground mt-1">أقسام نشطة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
