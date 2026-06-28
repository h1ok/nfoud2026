'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Upload, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CategoryItem = { slug: string; name: string };

const DEFAULT_CATEGORY_OPTIONS: CategoryItem[] = [
  { slug: 'politics', name: 'سياسة' },
  { slug: 'economy', name: 'اقتصاد' },
  { slug: 'local', name: 'محليات' },
  { slug: 'sports', name: 'رياضة' },
];

const STORAGE_BUCKET = 'news-images';

type EditorItem = {
  id: string;
  name: string;
  position: string | null;
  categories?: string[];
};

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editors, setEditors] = useState<EditorItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORY_OPTIONS);
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
    editor_id: '',
  });

  useEffect(() => {
    loadNews();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/editors', { cache: 'no-store' });
        const data = (await response.json()) as { items?: EditorItem[] };
        if (response.ok) setEditors(data.items ?? []);
      } catch (error) {
        console.error('Error loading editors:', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store' });
        const data = (await response.json()) as { items?: CategoryItem[] };
        if (response.ok && data.items?.length) setCategories(data.items);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    })();
  }, []);

  const editorsForCategory = useMemo(
    () =>
      editors.filter(
        (editor) => !editor.categories?.length || editor.categories.includes(formData.category)
      ),
    [editors, formData.category]
  );

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          category: data.category || 'politics',
          image_url: data.image_url || '',
          meta_description: data.meta_description || '',
          keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : '',
          location: data.location || '',
          editor_id: data.editor_id || '',
        });
      }
    } catch (error) {
      console.error('Error loading news:', error);
      alert('فشل تحميل الخبر');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('فشل رفع الصورة: ' + (error?.message || 'تأكد من إعداد bucket التخزين'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { editor_id, ...rest } = formData;
      const newsData = {
        ...rest,
        editor_id: editor_id || null,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', id);

      if (error) throw error;

      alert('تم تحديث الخبر بنجاح');
      router.push('/dashboard-control-panel-2025/news');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating news:', error);
      alert('فشل تحديث الخبر: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        const selected = editors.find((editor) => editor.id === prev.editor_id);
        if (selected?.categories?.length && !selected.categories.includes(value)) {
          next.editor_id = '';
        }
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تعديل الخبر</h1>
        <p className="text-muted-foreground mt-1">تحديث معلومات الخبر</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>معلومات الخبر</CardTitle>
            <CardDescription>عدّل الحقول المطلوبة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الخبر *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
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
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">القسم *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((option) => (
                    <SelectItem key={option.slug} value={option.slug}>{option.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editor_id">الكاتب *</Label>
              <Select value={formData.editor_id} onValueChange={(value) => handleChange('editor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الكاتب المتخصص في القسم" />
                </SelectTrigger>
                <SelectContent>
                  {editorsForCategory.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name}{editor.position ? ` - ${editor.position}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editorsForCategory.length === 0 && (
                <p className="text-xs text-destructive">لا يوجد كاتب متخصص في هذا القسم. أضف تخصصاً للكاتب أولاً.</p>
              )}
              <p className="text-xs text-muted-foreground">تُعرض فقط الكُتّاب المتخصصون في القسم المختار.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">المقتطف *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
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
                rows={12}
                required
                className="text-right font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_file">صورة الخبر</Label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-secondary/70">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{uploading ? 'جارٍ الرفع...' : 'رفع صورة'}</span>
                  <input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {formData.image_url && (
                  <button
                    type="button"
                    onClick={() => handleChange('image_url', '')}
                    className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                    إزالة
                  </button>
                )}
              </div>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="أو ألصق رابط صورة: https://example.com/image.jpg"
                type="url"
                className="text-left"
              />
              {formData.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.image_url} alt="معاينة الصورة" className="mt-2 h-40 w-full rounded-lg border border-border object-cover" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">وصف SEO</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
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
                className="text-right"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-5 w-5" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                disabled={saving}
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
