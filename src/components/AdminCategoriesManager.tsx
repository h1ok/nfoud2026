'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Pencil, Trash2, Save, X, Tags } from 'lucide-react';

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sort_order?: number;
};

const emptyForm = { name: '', slug: '', description: '', sort_order: 0 };

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories', { cache: 'no-store' });
      const data = (await response.json()) as { items?: CategoryItem[]; error?: string };
      if (!response.ok) throw new Error(data?.error || 'Failed');
      setCategories(data.items ?? []);
    } catch (err) {
      console.error(err);
      setError('فشل تحميل التصنيفات. تأكد من إنشاء جدول categories في Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const startEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sort_order: category.sort_order ?? 0,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('اسم التصنيف مطلوب');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const isEdit = Boolean(editingId);
      const payload = isEdit
        ? { id: editingId, name: form.name, description: form.description, sort_order: form.sort_order }
        : { name: form.name, slug: form.slug, description: form.description, sort_order: form.sort_order };
      const response = await fetch('/api/admin/categories', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'فشل حفظ التصنيف');
        return;
      }
      resetForm();
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setError('فشل حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: CategoryItem) => {
    if (!confirm(`هل أنت متأكد من حذف تصنيف "${category.name}"؟`)) return;
    try {
      const response = await fetch(`/api/admin/categories?id=${encodeURIComponent(category.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || 'فشل حذف التصنيف');
        return;
      }
      if (editingId === category.id) resetForm();
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('فشل حذف التصنيف');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-fit">
        <div className="mb-4 flex items-center gap-2 text-foreground">
          {editingId ? <Pencil size={18} className="text-gold" /> : <Tags size={18} className="text-gold" />}
          <h3 className="text-lg font-bold">{editingId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم (بالعربية) *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: تقنية، الذكاء الاصطناعي"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">المعرّف (slug)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="technology, ai"
              className="text-left"
              dir="ltr"
              disabled={Boolean(editingId)}
            />
            <p className="text-xs text-muted-foreground">
              {editingId
                ? 'لا يمكن تغيير المعرّف بعد الإنشاء.'
                : 'يُستخدم في الرابط. اتركه فارغاً لتوليده تلقائياً من الاسم.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف (اختياري)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="وصف قصير للقسم (يظهر في رأس الصفحة وSEO)"
              rows={2}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">الترتيب</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
              className="text-left"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'حفظ التغييرات' : 'إضافة التصنيف'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                <X size={16} />
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">التصنيفات ({categories.length})</h3>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="gap-2 text-gold">
            <Plus size={16} />
            تصنيف جديد
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : categories.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">لا توجد تصنيفات بعد.</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`rounded-xl border p-4 transition ${
                  editingId === category.id ? 'border-gold bg-gold/5' : 'border-border bg-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{category.name}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground" dir="ltr">
                        {category.slug}
                      </span>
                    </div>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">الترتيب: {category.sort_order ?? 0}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-gold hover:text-gold"
                      aria-label="تعديل"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="rounded-lg border border-destructive/30 p-2 text-destructive transition hover:bg-destructive/10"
                      aria-label="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
