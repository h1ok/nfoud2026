-- ============================================
-- جدول التصنيفات (categories) — تصنيفات ديناميكية
-- شغّل هذا الملف كاملاً في Supabase SQL Editor
-- يتيح إضافة أقسام جديدة مثل: التقنية، الذكاء الاصطناعي
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- فهرس للترتيب
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories (sort_order);

-- =====================
-- تعبئة الأقسام الحالية (آمن للتكرار)
-- =====================
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('politics', 'سياسة', 1),
  ('economy', 'اقتصاد', 2),
  ('local', 'محليات', 3),
  ('sports', 'رياضة', 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- أمثلة لأقسام جديدة (اختياري — أزل التعليق لإضافتها)
-- =====================
-- INSERT INTO public.categories (slug, name, sort_order) VALUES
--   ('technology', 'تقنية', 5),
--   ('ai', 'الذكاء الاصطناعي', 6)
-- ON CONFLICT (slug) DO NOTHING;

-- =====================
-- RLS: قراءة عامة، والكتابة عبر service role فقط (الـ API)
-- =====================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

-- =====================
-- تحقق
-- =====================
SELECT slug, name, sort_order FROM public.categories ORDER BY sort_order;
