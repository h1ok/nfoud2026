'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Search, Trash2, Pencil, ExternalLink, Calendar, ChevronsLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';

type AdminNewsItem = {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  created_at: string;
  excerpt: string | null;
  keywords: string[] | null;
  meta_description: string | null;
  content?: string | null;
  editor_id?: string | null;
  editors?: {
    name: string;
    position: string | null;
  } | null;
};

type EditorItem = {
  id: string;
  name: string;
  position: string | null;
  categories?: string[];
};

type ApiResponse = {
  items: AdminNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const categories = [
  { value: 'politics', label: 'سياسية' },
  { value: 'economy', label: 'اقتصادية' },
  { value: 'local', label: 'محلية' },
  { value: 'sports', label: 'رياضية' },
];

const emptyPagination = { page: 1, limit: 100, total: 0, totalPages: 1 };

export default function AdminNewsManager() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [editors, setEditors] = useState<EditorItem[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEditItem, setLoadingEditItem] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNewsItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', excerpt: '', category: 'local', meta_description: '', keywords: '', content: '', editor_id: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchEditors = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/editors', { cache: 'no-store' });
      const data = (await response.json()) as { items?: EditorItem[] };

      if (!response.ok) {
        throw new Error('Failed to fetch editors');
      }

      setEditors(data.items ?? []);
    } catch (error) {
      console.error(error);
      setEditors([]);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      if (search.trim()) params.set('q', search.trim());

      const response = await fetch(`/api/admin/news?${params.toString()}`, { cache: 'no-store' });
      const data = (await response.json()) as ApiResponse | { error: string };

      if (!response.ok || !('items' in data)) {
        throw new Error('Failed to fetch admin news');
      }

      setItems(data.items);
      setPagination(data.pagination);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setItems([]);
      setPagination(emptyPagination);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  useEffect(() => {
    if (!isEditModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isEditModalOpen]);

  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const categoryLabel = useMemo(
    () => categories.find((category) => category.value === editForm.category)?.label ?? editForm.category,
    [editForm.category]
  );

  const editorsForCategory = useMemo(
    () =>
      editors.filter(
        (editor) => !editor.categories?.length || editor.categories.includes(editForm.category)
      ),
    [editors, editForm.category]
  );

  const selectedEditorMismatch = useMemo(() => {
    if (!editForm.editor_id) return false;
    const selected = editors.find((editor) => editor.id === editForm.editor_id);
    if (!selected || !selected.categories?.length) return false;
    return !selected.categories.includes(editForm.category);
  }, [editors, editForm.editor_id, editForm.category]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(items.map((item) => item.id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`سيتم حذف ${selectedIds.length} خبر. هل أنت متأكد؟`);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete selected news');
      }

      await fetchItems();
    } catch (error) {
      console.error(error);
      window.alert('تعذر حذف الأخبار المحددة.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSingleDelete(id: string) {
    const confirmed = window.confirm('سيتم حذف هذا الخبر نهائياً. هل أنت متأكد؟');
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete news item');
      }

      await fetchItems();
    } catch (error) {
      console.error(error);
      window.alert('تعذر حذف الخبر.');
    } finally {
      setSubmitting(false);
    }
  }

  async function openEdit(item: AdminNewsItem) {
    setLoadingEditItem(true);
    try {
      const response = await fetch(`/api/admin/news?id=${encodeURIComponent(item.id)}`, { cache: 'no-store' });
      const data = (await response.json()) as { item?: AdminNewsItem };

      if (!response.ok || !data.item) {
        throw new Error('Failed to fetch news item for editing');
      }

      setEditingItem(data.item);
      setEditForm({
        title: data.item.title,
        excerpt: data.item.excerpt || '',
        category: data.item.category,
        meta_description: data.item.meta_description || '',
        keywords: data.item.keywords?.join(', ') || '',
        content: data.item.content || '',
        editor_id: data.item.editor_id || '',
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error(error);
      window.alert('تعذر فتح نافذة التعديل لهذا الخبر.');
    } finally {
      setLoadingEditItem(false);
    }
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditingItem(null);
  }

  async function handleSaveEdit() {
    if (!editingItem) return;

    if (selectedEditorMismatch) {
      window.alert('الكاتب المختار غير متخصص في قسم المقال. اختر كاتباً مناسباً قبل الحفظ.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          title: editForm.title,
          content: editForm.content,
          excerpt: editForm.excerpt,
          category: editForm.category,
          editor_id: editForm.editor_id,
          meta_description: editForm.meta_description,
          keywords: editForm.keywords.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update news');
      }

      closeEditModal();
      await fetchItems();
    } catch (error) {
      console.error(error);
      window.alert('تعذر حفظ التعديلات.');
    } finally {
      setSubmitting(false);
    }
  }

  function submitSearch() {
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitSearch();
                }}
                placeholder="ابحث في العنوان أو الوصف أو الكلمات الدلالية"
                className="w-full rounded-xl border border-border bg-background py-3 pr-10 pl-4 text-sm outline-none transition focus:border-gold"
              />
            </div>
            <button onClick={submitSearch} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90">
              بحث
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">إجمالي النتائج: {pagination.total}</div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>حذف المحدد ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/60 text-foreground">
              <tr>
                <th className="px-4 py-3 text-right font-bold">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4" />
                </th>
                <th className="px-4 py-3 text-right font-bold">العنوان</th>
                <th className="px-4 py-3 text-right font-bold">القسم</th>
                <th className="px-4 py-3 text-right font-bold">الكلمات الدلالية</th>
                <th className="px-4 py-3 text-right font-bold">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">جاري تحميل الأخبار...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">لا توجد أخبار مطابقة.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-border align-top">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        {item.excerpt && <div className="max-w-xl text-xs leading-6 text-muted-foreground">{item.excerpt}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        {(item.keywords || []).length > 0 ? (
                          item.keywords?.map((keyword) => (
                            <span key={keyword} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground">{keyword}</span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <div className="inline-flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {item.editors?.name && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {item.editors.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void openEdit(item); }} disabled={loadingEditItem} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-50">
                          <Pencil size={14} />
                          <span>{loadingEditItem ? 'جاري الفتح...' : 'تعديل'}</span>
                        </button>
                        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleSingleDelete(item.id); }} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10">
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                        {item.slug && (
                          <Link href={`/article/${item.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-gold transition hover:bg-secondary">
                            <ExternalLink size={14} />
                            <span>عرض</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">
          الصفحة {pagination.page} من {pagination.totalPages} - يتم عرض {pagination.limit} خبر في الصفحة
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page <= 1 || loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
            <ChevronsLeft size={16} />
            <span>الأولى</span>
          </button>
          <button onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1 || loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
            <ChevronRight size={16} />
            <span>السابق</span>
          </button>
          <button onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))} disabled={page >= pagination.totalPages || loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
            <span>التالي</span>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setPage(pagination.totalPages)} disabled={page >= pagination.totalPages || loading} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
            الأخير
          </button>
        </div>
      </div>

      {mounted && isEditModalOpen && editingItem && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/55 p-4 md:p-6" onClick={closeEditModal}>
          <div className="flex h-full items-center justify-center">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">تعديل الخبر</h3>
                  <p className="mt-1 text-sm text-muted-foreground">يمكنك تعديل الصياغة والتصنيف وربط الخبر بكاتب.</p>
                </div>
                <button type="button" onClick={closeEditModal} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary">
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">العنوان</label>
                    <input value={editForm.title} onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">القسم</label>
                    <select value={editForm.category} onChange={(e) => setEditForm((current) => ({ ...current, category: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold">
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">الكاتب</label>
                    <select value={editForm.editor_id} onChange={(e) => setEditForm((current) => ({ ...current, editor_id: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold">
                      <option value="">بدون كاتب</option>
                      {editorsForCategory.map((editor) => (
                        <option key={editor.id} value={editor.id}>{editor.name}{editor.position ? ` - ${editor.position}` : ''}</option>
                      ))}
                    </select>
                    {editorsForCategory.length === 0 && (
                      <p className="mt-2 text-xs text-destructive">لا يوجد كاتب متخصص في هذا القسم. أضِف تخصصاً للكاتب أولاً.</p>
                    )}
                    {selectedEditorMismatch && (
                      <p className="mt-2 text-xs text-destructive">الكاتب المختار غير متخصص في قسم «{categoryLabel}». اختر كاتباً مناسباً.</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">الكلمات الدلالية</label>
                    <input value={editForm.keywords} onChange={(e) => setEditForm((current) => ({ ...current, keywords: e.target.value }))} placeholder="مثال: السعودية, اقتصاد, نفط" className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">الوصف المختصر</label>
                    <textarea value={editForm.excerpt} onChange={(e) => setEditForm((current) => ({ ...current, excerpt: e.target.value }))} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">صياغة الخبر / المحتوى</label>
                    <textarea value={editForm.content} onChange={(e) => setEditForm((current) => ({ ...current, content: e.target.value }))} rows={12} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold leading-7" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">Meta Description</label>
                    <textarea value={editForm.meta_description} onChange={(e) => setEditForm((current) => ({ ...current, meta_description: e.target.value }))} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">
                <button type="button" onClick={closeEditModal} className="rounded-xl border border-border px-4 py-2 text-sm font-medium">إلغاء</button>
                <button type="button" onClick={handleSaveEdit} disabled={submitting} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">حفظ التعديلات</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
