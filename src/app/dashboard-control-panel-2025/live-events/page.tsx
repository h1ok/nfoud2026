import { Suspense } from 'react';
import Link from 'next/link';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { Radio, ArrowLeft, Clock3, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase';
import { backfillLiveEventUpdates } from '@/lib/live-events';
import { LiveEventKeywordAutoSuggest } from '@/components/LiveEventKeywordAutoSuggest';
import { getCategories } from '@/lib/categories';

function freshClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? '',
    { global: { fetch: (url: RequestInfo | URL, opts: RequestInit = {}) => fetch(url, { ...opts, cache: 'no-store' }) } },
  );
}

export const dynamic = 'force-dynamic';

async function liveEventsSupportsKeywords() {
  const { error } = await supabaseServer.from('live_events').select('keywords').limit(1);
  return !error;
}

function parseKeywordsInput(value: string) {
  return value
    .split(/[\n,،#]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


interface AdminLiveEvent {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  main_image_url: string | null;
  keywords?: string[] | null;
  status: 'active' | 'ended' | 'archived';
  created_at?: string;
  updated_at: string;
  updates_count?: number;
}

async function getLiveEvents(): Promise<AdminLiveEvent[]> {
  unstable_noStore();
  const db = freshClient();

  const { data, error } = await db
    .from('live_events')
    .select('*, live_event_updates(count)')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Failed to fetch live events for dashboard:', error);
    return [];
  }

  return ((data as unknown as any[]) ?? []).map((event) => ({
    ...event,
    keywords: Array.isArray(event.keywords) ? event.keywords : null,
    updates_count: event.live_event_updates?.[0]?.count ?? 0,
  })) as AdminLiveEvent[];
}

async function getLiveEventById(eventId: string): Promise<AdminLiveEvent | null> {
  unstable_noStore();
  const db = freshClient();

  const { data, error } = await db
    .from('live_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  const event = data as unknown as AdminLiveEvent;

  return {
    ...event,
    keywords: Array.isArray(event.keywords) ? event.keywords : null,
  };
}

function getStatusLabel(status: AdminLiveEvent['status']) {
  if (status === 'active') return 'نشط';
  if (status === 'ended') return 'منتهي';
  return 'مؤرشف';
}

async function updateLiveEventStatus(formData: FormData) {
  'use server';

  const eventId = String(formData.get('eventId') || '');
  const nextStatus = String(formData.get('nextStatus') || '') as AdminLiveEvent['status'];

  if (!eventId || !['active', 'ended', 'archived'].includes(nextStatus)) {
    return;
  }

  await supabaseServer
    .from('live_events')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', eventId);

  revalidatePath('/dashboard-control-panel-2025/live-events');
  revalidatePath('/live');
  revalidatePath('/');
}

async function updateLiveEvent(formData: FormData) {
  'use server';

  const eventId = String(formData.get('eventId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  const category = String(formData.get('category') || 'local').trim() || 'local';
  const mainImageUrl = String(formData.get('mainImageUrl') || '').trim() || null;
  const keywordsRaw = String(formData.get('keywords') || '').trim();

  if (!eventId || !title) {
    return;
  }

  const payload: Record<string, any> = {
    title,
    summary: summary || null,
    category,
    main_image_url: mainImageUrl,
    updated_at: new Date().toISOString(),
  };

  const parsedKeywords = parseKeywordsInput(keywordsRaw);

  if (await liveEventsSupportsKeywords()) {
    payload.keywords = parsedKeywords.length > 0 ? parsedKeywords : null;
  }

  await supabaseServer
    .from('live_events')
    .update(payload)
    .eq('id', eventId);

  await backfillLiveEventUpdates(supabaseServer, {
    id: eventId,
    title,
    summary,
    category,
    keywords: parsedKeywords,
  }, {
    days: 365,
    limit: 2000,
  });

  revalidatePath('/dashboard-control-panel-2025/live-events');
  revalidatePath(`/live/${eventId}`);
  revalidatePath('/live');
  revalidatePath('/');
}

async function deleteLiveEvent(formData: FormData) {
  'use server';

  const eventId = String(formData.get('eventId') || '').trim();

  if (!eventId) {
    return;
  }

  await supabaseServer
    .from('live_event_updates')
    .delete()
    .eq('live_event_id', eventId);

  await supabaseServer
    .from('live_events')
    .delete()
    .eq('id', eventId);

  revalidatePath('/dashboard-control-panel-2025/live-events');
  revalidatePath('/live');
  revalidatePath('/');
}

async function syncExistingLiveEvent(formData: FormData) {
  'use server';

  const eventId = String(formData.get('eventId') || '').trim();

  if (!eventId) {
    return;
  }

  const supportsKeywords = await liveEventsSupportsKeywords();
  const selectFields = supportsKeywords ? 'id, title, summary, category, keywords' : 'id, title, summary, category';

  const { data: event, error } = await supabaseServer
    .from('live_events')
    .select(selectFields)
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return;
  }

  const eventData: any = event;
  await backfillLiveEventUpdates(supabaseServer, {
    id: eventData.id,
    title: eventData.title,
    summary: eventData.summary,
    category: eventData.category,
    keywords: supportsKeywords && Array.isArray(eventData.keywords) ? eventData.keywords : null,
  }, {
    days: 365,
    limit: 2000,
  });

  revalidatePath('/dashboard-control-panel-2025/live-events');
  revalidatePath(`/live/${eventId}`);
  revalidatePath('/live');
  revalidatePath('/');
}

async function createManualLiveEvent(formData: FormData) {
  'use server';

  const title = String(formData.get('title') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  const category = String(formData.get('category') || 'local').trim() || 'local';
  const mainImageUrl = String(formData.get('mainImageUrl') || '').trim() || null;
  const keywordsRaw = String(formData.get('keywords') || '').trim();

  if (!title) {
    return;
  }

  const payload: Record<string, any> = {
    title,
    summary: summary || title,
    category,
    main_image_url: mainImageUrl,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const parsedKeywords = parseKeywordsInput(keywordsRaw);

  payload.keywords = parsedKeywords.length > 0 ? parsedKeywords : null;

  const { data: createdEvent, error } = await supabaseServer
    .from('live_events')
    .insert(payload)
    .select('id, title, summary, category')
    .single();

  if (error || !createdEvent) {
    return;
  }

  await backfillLiveEventUpdates(supabaseServer, {
    id: createdEvent.id,
    title: createdEvent.title,
    summary: createdEvent.summary,
    category: createdEvent.category,
    keywords: parsedKeywords,
  }, {
    days: 365,
    limit: 2000,
  });

  revalidatePath('/dashboard-control-panel-2025/live-events');
  revalidatePath(`/live/${createdEvent.id}`);
  revalidatePath('/live');
  revalidatePath('/');
}

function StatusButton({
  eventId,
  nextStatus,
  label,
  tone,
}: {
  eventId: string;
  nextStatus: AdminLiveEvent['status'];
  label: string;
  tone: string;
}) {
  return (
    <form action={updateLiveEventStatus}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <button type="submit" className={`inline-flex min-h-9 items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition ${tone}`}>
        {label}
      </button>
    </form>
  );
}

function LiveEventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 rounded bg-muted" />
                  <div className="h-4 w-72 rounded bg-muted" />
                  <div className="flex gap-1.5 mt-3">
                    <div className="h-6 w-16 rounded-full bg-muted" />
                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function LiveEventsContent({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; create?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const editEventId = resolvedSearchParams?.edit?.trim() || '';
  const isCreateModalOpen = resolvedSearchParams?.create === '1';
  const [liveEvents, editingEvent] = await Promise.all([
    getLiveEvents(),
    editEventId ? getLiveEventById(editEventId) : Promise.resolve(null),
  ]);
  const allLiveEvents = editingEvent && !liveEvents.some((event) => event.id === editingEvent.id)
    ? [editingEvent, ...liveEvents]
    : liveEvents;
  const categories = await getCategories();
  const categoryOptions = categories.map((c) => [c.slug, c.name] as const);

  return (
    <>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-foreground">إنشاء بث حي</h3>
                <p className="mt-1 text-sm text-muted-foreground">أضف بثًا حيًا جديدًا من النافذة المنبثقة.</p>
              </div>
              <Link href="/dashboard-control-panel-2025/live-events" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary">
                إغلاق
              </Link>
            </div>

            <form action={createManualLiveEvent} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                id="create-title"
                type="text"
                name="title"
                placeholder="عنوان الحدث"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <select
                name="category"
                defaultValue="local"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                name="mainImageUrl"
                placeholder="رابط الصورة الرئيسية"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
              />
              <textarea
                id="create-summary"
                name="summary"
                placeholder="وصف الحدث"
                rows={3}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
              />
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground">الكلمات المفتاحية</span>
                  <input
                    id="create-keywords"
                    type="text"
                    name="keywords"
                    placeholder="الكلمات المفتاحية المقترحة ستظهر هنا، ويمكنك تعديلها"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <p className="text-xs text-muted-foreground">بمجرد كتابة عنوان التغطية الحية، سيتم اقتراح كلمات مفتاحية تلقائيًا.</p>
                  <LiveEventKeywordAutoSuggest titleInputId="create-title" summaryInputId="create-summary" keywordsInputId="create-keywords" />
                </div>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="rounded-xl bg-gold px-4 py-3 text-sm font-bold text-primary transition hover:bg-gold/90">
                  إنشاء بث حي
                </button>
                <Link href="/dashboard-control-panel-2025/live-events" className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition hover:bg-secondary">
                  إلغاء
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-foreground">تعديل الحدث</h3>
                <p className="mt-1 text-sm text-muted-foreground">حدّث بيانات الحدث والكلمات المفتاحية من النافذة المنبثقة.</p>
              </div>
              <Link href="/dashboard-control-panel-2025/live-events" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary">
                إغلاق
              </Link>
            </div>

            <form action={updateLiveEvent} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input type="hidden" name="eventId" value={editingEvent.id} />
              <input
                id="edit-title"
                type="text"
                name="title"
                defaultValue={editingEvent.title}
                placeholder="عنوان الحدث"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <select
                name="category"
                defaultValue={editingEvent.category}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                name="mainImageUrl"
                defaultValue={editingEvent.main_image_url || ''}
                placeholder="رابط الصورة الرئيسية"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
              />
              <textarea
                id="edit-summary"
                name="summary"
                defaultValue={editingEvent.summary || ''}
                placeholder="وصف الحدث"
                rows={4}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none md:col-span-2"
              />
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground">الكلمات المفتاحية</span>
                  <input
                    id="edit-keywords"
                    type="text"
                    name="keywords"
                    defaultValue={editingEvent.keywords?.join(', ') || ''}
                    placeholder="الكلمات المفتاحية المقترحة ستظهر هنا، ويمكنك تعديلها"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <p className="text-xs text-muted-foreground">سيتم تحديث الكلمات المفتاحية المقترحة تلقائيًا عند تعديل عنوان الحدث أو وصفه.</p>
                  <LiveEventKeywordAutoSuggest titleInputId="edit-title" summaryInputId="edit-summary" keywordsInputId="edit-keywords" />
                </div>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                  حفظ التعديلات
                </button>
                <Link href="/dashboard-control-panel-2025/live-events" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary">
                  إلغاء
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {allLiveEvents.map((event) => (
          <article key={event.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-destructive/10 p-2 text-destructive">
                    <Radio size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{event.summary || 'لا يوجد وصف لهذا الحدث.'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{event.category}</span>
                      {event.keywords?.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/70">#{keyword}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">{getStatusLabel(event.status)}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{event.updates_count ?? 0} تحديث</span>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 size={14} />
                  <span>{event.updated_at ? new Date(event.updated_at).toLocaleDateString('ar-SA') : '—'}</span>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard-control-panel-2025/live-events?edit=${event.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground transition hover:bg-secondary"
                      aria-label="تعديل الحدث"
                      title="تعديل الحدث"
                    >
                      <Pencil size={15} />
                    </Link>
                    <form action={deleteLiveEvent}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                        aria-label="حذف الحدث"
                        title="حذف الحدث"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                    {event.status !== 'active' && (
                      <StatusButton eventId={event.id} nextStatus="active" label="جعله حيًا" tone="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
                    )}
                    {event.status !== 'archived' && (
                      <StatusButton eventId={event.id} nextStatus="archived" label="إلغاء البث" tone="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" />
                    )}
                  </div>
                </div>
                <Link href={`/live/${event.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline">
                  <span>فتح الحدث</span>
                  <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}

        {allLiveEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            لا توجد أحداث حية حالياً.
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardLiveEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string; create?: string }>;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">الأحداث الحية</h2>
          <p className="mt-2 text-muted-foreground">تحكم كامل في الأحداث الحية الحالية مع إنشاء يدوي وتحرير سريع.</p>
        </div>
        <Link
          href="/dashboard-control-panel-2025/live-events?create=1"
          className="inline-flex items-center justify-center rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-primary transition hover:bg-gold/90"
        >
          إنشاء بث حي
        </Link>
      </div>

      <Suspense fallback={<LiveEventsSkeleton />}>
        <LiveEventsContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
