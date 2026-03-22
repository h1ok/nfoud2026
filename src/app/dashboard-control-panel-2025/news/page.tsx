import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import DeleteNewsButton from '@/components/dashboard/DeleteNewsButton';

export const revalidate = 0;

async function getAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data || [];
}

export default async function NewsManagementPage() {
  const news = await getAllNews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأخبار</h1>
          <p className="text-muted-foreground mt-1">عرض وتعديل وحذف الأخبار</p>
        </div>
        <Link href="/dashboard-control-panel-2025/news/new">
          <Button size="lg">
            <PlusCircle className="ml-2 h-5 w-5" />
            إضافة خبر جديد
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الأخبار ({news.length})</CardTitle>
          <CardDescription>قائمة بجميع الأخبار المنشورة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد أخبار منشورة</p>
                <Link href="/dashboard-control-panel-2025/news/new">
                  <Button className="mt-4">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة أول خبر
                  </Button>
                </Link>
              </div>
            ) : (
              news.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {article.image_url && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded">{article.category}</span>
                      <span>{new Date(article.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/article/${article.slug || article.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard-control-panel-2025/news/edit/${article.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteNewsButton newsId={article.id} newsTitle={article.title} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
