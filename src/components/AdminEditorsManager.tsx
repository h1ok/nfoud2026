'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Pencil, Trash2, Save, X, UserPlus } from 'lucide-react';

type EditorItem = {
  id: string;
  name: string;
  position: string | null;
  bio?: string | null;
  categories?: string[];
};

type CategoryOption = { value: string; label: string };

const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'politics', label: 'سياسة' },
  { value: 'economy', label: 'اقتصاد' },
  { value: 'local', label: 'محليات' },
  { value: 'sports', label: 'رياضة' },
];

const emptyForm = { name: '', position: '', bio: '', categories: [] as string[] };

export default function AdminEditorsManager() {
  const [editors, setEditors] = useState<EditorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(DEFAULT_CATEGORY_OPTIONS);

  const categoryLabels = useMemo(
    () => Object.fromEntries(categoryOptions.map((option) => [option.value, option.label])),
    [categoryOptions]
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store' });
        const data = (await response.json()) as { items?: { slug: string; name: string }[] };
        if (response.ok && data.items?.length) {
          setCategoryOptions(data.items.map((item) => ({ value: item.slug, label: item.name })));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    })();
  }, []);

  const fetchEditors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/editors', { cache: 'no-store' });
      const data = (await response.json()) as { items?: EditorItem[] };
      if (!response.ok) throw new Error('Failed to fetch editors');
      setEditors(data.items ?? []);
    } catch (err) {
      console.error(err);
      setError('فشل تحميل الكُتّاب');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const startEdit = (editor: EditorItem) => {
    setEditingId(editor.id);
    setForm({
      name: editor.name,
      position: editor.position ?? '',
      bio: editor.bio ?? '',
      categories: editor.categories ?? [],
    });
    setError('');
  };

  const toggleCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('اسم الكاتب مطلوب');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const isEdit = Boolean(editingId);
      const response = await fetch('/api/admin/editors', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingId, ...form } : form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'فشل حفظ الكاتب');
        return;
      }
      resetForm();
      await fetchEditors();
    } catch (err) {
      console.error(err);
      setError('فشل حفظ الكاتب');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (editor: EditorItem) => {
    if (!confirm(`هل أنت متأكد من حذف الكاتب "${editor.name}"؟`)) return;
    try {
      const response = await fetch(`/api/admin/editors?id=${encodeURIComponent(editor.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || 'فشل حذف الكاتب');
        return;
      }
      if (editingId === editor.id) resetForm();
      await fetchEditors();
    } catch (err) {
      console.error(err);
      alert('فشل حذف الكاتب');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-fit">
        <div className="mb-4 flex items-center gap-2 text-foreground">
          {editingId ? <Pencil size={18} className="text-gold" /> : <UserPlus size={18} className="text-gold" />}
          <h3 className="text-lg font-bold">{editingId ? 'تعديل الكاتب' : 'إضافة كاتب جديد'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="اسم الكاتب"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">المنصب</Label>
            <Input
              id="position"
              value={form.position}
              onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
              placeholder="محلل سياسي، محرر اقتصادي..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">نبذة</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="نبذة تعريفية عن الكاتب"
              rows={3}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label>التصنيفات (التخصصات)</Label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => {
                const active = form.categories.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleCategory(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? 'border-gold bg-gold text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:border-gold/50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">تحدد الأقسام التي يُسند إليها الكاتب في الأخبار.</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'حفظ التغييرات' : 'إضافة الكاتب'}
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
          <h3 className="text-lg font-bold text-foreground">الكُتّاب ({editors.length})</h3>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="gap-2 text-gold">
            <Plus size={16} />
            كاتب جديد
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : editors.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">لا يوجد كُتّاب بعد. أضف أول كاتب.</p>
        ) : (
          <div className="space-y-3">
            {editors.map((editor) => (
              <div
                key={editor.id}
                className={`rounded-xl border p-4 transition ${
                  editingId === editor.id ? 'border-gold bg-gold/5' : 'border-border bg-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{editor.name}</p>
                    {editor.position && (
                      <p className="text-sm text-muted-foreground">{editor.position}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {editor.categories && editor.categories.length > 0 ? (
                        editor.categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold"
                          >
                            {categoryLabels[category] || category}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          بدون تخصص
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(editor)}
                      className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-gold hover:text-gold"
                      aria-label="تعديل"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(editor)}
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
