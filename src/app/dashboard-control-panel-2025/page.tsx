import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Radio, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getDashboardStats() {
  const [newsCount, liveEventsCount, recentNews] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('live_events').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('news').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    totalNews: newsCount.count || 0,
    activeLiveEvents: liveEventsCount.count || 0,
    recentNews: recentNews.data || [],
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في نظام إدارة محتوى نفود الإخبارية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">الأحداث الحية</CardTitle>
            <Radio className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeLiveEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">التغطيات النشطة حالياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإحصائيات</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground mt-1">نمو هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>آخر الأخبار المنشورة</CardTitle>
            <CardDescription>آخر 5 أخبار تم نشرها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentNews.map((news) => (
                <div key={news.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(news.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded mr-3">{news.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard-control-panel-2025/news/new">
              <Button className="w-full justify-start" size="lg">
                <Newspaper className="ml-2 h-5 w-5" />
                إضافة خبر جديد
              </Button>
            </Link>
            <Link href="/dashboard-control-panel-2025/news">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Eye className="ml-2 h-5 w-5" />
                عرض جميع الأخبار
              </Button>
            </Link>
            <Link href="/dashboard-control-panel-2025/statistics">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <TrendingUp className="ml-2 h-5 w-5" />
                عرض الإحصائيات
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
