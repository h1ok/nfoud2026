-- ============================================
-- إصلاح قاعدة بيانات نفود - Supabase SQL Editor
-- شغّل هذا الكود كاملاً في SQL Editor
-- ============================================

-- =====================
-- 1. إصلاح جدول editors
-- =====================
-- إضافة قيم افتراضية
ALTER TABLE public.editors ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.editors ALTER COLUMN created_at SET DEFAULT now();

-- سياسة RLS للقراءة العامة
ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_editors" ON public.editors;
CREATE POLICY "public_read_editors" ON public.editors
  FOR SELECT USING (true);

-- =====================
-- 2. إصلاح جدول news
-- =====================
-- قيم افتراضية
ALTER TABLE public.news ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.news ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.news ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.news ALTER COLUMN status SET DEFAULT 'published';

-- تحويل views من text إلى integer
ALTER TABLE public.news ALTER COLUMN views TYPE integer USING (COALESCE(NULLIF(views, ''), '0'))::integer;
ALTER TABLE public.news ALTER COLUMN views SET DEFAULT 0;

-- تحويل keywords من text إلى jsonb
ALTER TABLE public.news ALTER COLUMN keywords TYPE jsonb USING (
  CASE
    WHEN keywords IS NULL THEN NULL
    WHEN keywords ~ '^\[' THEN keywords::jsonb
    WHEN keywords ~ '^\{' THEN keywords::jsonb
    ELSE to_jsonb(string_to_array(keywords, ','))
  END
);

-- تحويل key_points من text إلى jsonb
ALTER TABLE public.news ALTER COLUMN key_points TYPE jsonb USING (
  CASE
    WHEN key_points IS NULL THEN NULL
    WHEN key_points ~ '^\[' THEN key_points::jsonb
    WHEN key_points ~ '^\{' THEN key_points::jsonb
    ELSE to_jsonb(ARRAY[key_points])
  END
);

-- سياسة RLS للقراءة العامة
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_news" ON public.news;
CREATE POLICY "public_read_news" ON public.news
  FOR SELECT USING (true);

-- =====================
-- 3. إصلاح جدول editor_categories
-- =====================
ALTER TABLE public.editor_categories ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.editor_categories ALTER COLUMN created_at SET DEFAULT now();

-- إضافة العلاقة المفقودة مع editors
ALTER TABLE public.editor_categories DROP CONSTRAINT IF EXISTS fk_editor_categories_editor;
ALTER TABLE public.editor_categories
  ADD CONSTRAINT fk_editor_categories_editor
  FOREIGN KEY (editor_id) REFERENCES public.editors(id) ON DELETE CASCADE;

-- =====================
-- 4. إصلاح جدول live_events
-- =====================
ALTER TABLE public.live_events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.live_events ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.live_events ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.live_events ALTER COLUMN status SET DEFAULT 'active';

-- سياسة RLS
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_live_events" ON public.live_events;
CREATE POLICY "public_read_live_events" ON public.live_events
  FOR SELECT USING (true);

-- =====================
-- 5. إصلاح جدول live_event_updates
-- =====================
ALTER TABLE public.live_event_updates ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.live_event_updates ALTER COLUMN created_at SET DEFAULT now();

-- إصلاح اسم العمود: الكود يستخدم live_event_id لكن الجدول فيه event_id
ALTER TABLE public.live_event_updates DROP CONSTRAINT IF EXISTS fk_live_event_updates_event;
ALTER TABLE public.live_event_updates RENAME COLUMN event_id TO live_event_id;
ALTER TABLE public.live_event_updates
  ADD CONSTRAINT fk_live_event_updates_event
  FOREIGN KEY (live_event_id) REFERENCES public.live_events(id) ON DELETE CASCADE;

-- سياسة RLS
ALTER TABLE public.live_event_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_live_event_updates" ON public.live_event_updates;
CREATE POLICY "public_read_live_event_updates" ON public.live_event_updates
  FOR SELECT USING (true);

-- =====================
-- 6. إصلاح الجداول الأخرى
-- =====================
-- newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.newsletter_subscribers ALTER COLUMN subscribed_at SET DEFAULT now();
ALTER TABLE public.newsletter_subscribers ALTER COLUMN is_active SET DEFAULT true;

-- site_visits
ALTER TABLE public.site_visits ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.site_visits ALTER COLUMN visited_at SET DEFAULT now();

-- user_roles
ALTER TABLE public.user_roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.user_roles ALTER COLUMN created_at SET DEFAULT now();

-- admin_requests
ALTER TABLE public.admin_requests ALTER COLUMN created_at SET DEFAULT now();

-- =====================
-- 7. ملء البيانات الفارغة
-- =====================
-- تعيين created_at للمقالات بدون تاريخ
UPDATE public.news SET created_at = now() WHERE created_at IS NULL;
UPDATE public.news SET updated_at = created_at WHERE updated_at IS NULL;

-- تعيين المحرر الافتراضي للمقالات بدون محرر
UPDATE public.news SET editor_id = (
  SELECT id FROM public.editors ORDER BY created_at ASC LIMIT 1
) WHERE editor_id IS NULL;

-- تعيين created_at للمحررين بدون تاريخ
UPDATE public.editors SET created_at = now() WHERE created_at IS NULL;

-- ============================================
-- تم الانتهاء ✅
-- ============================================
