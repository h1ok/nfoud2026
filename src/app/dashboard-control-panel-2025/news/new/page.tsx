'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'politics',
    image_url: '',
    meta_description: '',
    keywords: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newsData = {
        ...formData,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('news').insert([newsData]);

      if (error) throw error;

      alert('تم إضافة الخبر بنجاح');
      router.push('/dashboard-control-panel-2025/news');
      router.refresh();
    } catch (error: any) {
      console.error('Error adding news:', error);
      alert('فشل إضافة الخبر: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إضافة خبر جديد</h1>
        <p className="text-muted-foreground mt-1">أضف خبر جديد إلى الموقع</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>معلومات الخبر</CardTitle>
            <CardDescription>املأ جميع الحقول المطلوبة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الخبر *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="عنوان الخبر"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">الرابط (Slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="news-slug"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">يتم إنشاؤه تلقائياً من العنوان</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">القسم *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="politics">سياسة</SelectItem>
                  <SelectItem value="economy">اقتصاد</SelectItem>
                  <SelectItem value="local">محليات</SelectItem>
                  <SelectItem value="sports">رياضة</SelectItem>
                  <SelectItem value="technology">تقنية</SelectItem>
                  <SelectItem value="culture">ثقافة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">المقتطف *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="ملخص قصير للخبر"
                rows={3}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">المحتوى *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="محتوى الخبر الكامل (يدعم HTML)"
                rows={12}
                required
                className="text-right font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">رابط الصورة</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="الرياض، السعودية"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">وصف SEO</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                placeholder="وصف الخبر لمحركات البحث (160 حرف)"
                rows={2}
                maxLength={160}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">الكلمات المفتاحية</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="كلمة1, كلمة2, كلمة3"
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">افصل بين الكلمات بفاصلة</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-5 w-5" />
                    حفظ الخبر
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
