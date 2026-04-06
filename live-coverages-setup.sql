-- ============================================
-- إنشاء 4 تغطيات حية - نفود
-- ============================================

-- 1. إضافة عمود live_event_id لجدول news إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'live_event_id'
    ) THEN
        ALTER TABLE public.news ADD COLUMN live_event_id text REFERENCES public.live_events(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. إنشاء التغطيات الحية الأربعة

-- التغطية 1: حرب إسرائيل وإيران
INSERT INTO public.live_events (
  id,
  title,
  summary,
  category,
  status,
  main_image_url,
  created_at,
  updated_at
) VALUES (
  'live-israel-iran-war',
  'التغطية الحية: الحرب بين إسرائيل وإيران',
  'تابع آخر التطورات والأحداث الميدانية في الصراع المتصاعد بين إسرائيل وإيران، مع تحديثات لحظية حول العمليات العسكرية والتصريحات الرسمية والتداعيات الإقليمية والدولية.',
  'politics',
  'active',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  updated_at = NOW();

-- التغطية 2: موقف السعودية من الحرب
INSERT INTO public.live_events (
  id,
  title,
  summary,
  category,
  status,
  main_image_url,
  created_at,
  updated_at
) VALUES (
  'live-saudi-position-iran-israel',
  'التغطية الحية: موقف السعودية من الحرب بين إيران وإسرائيل',
  'رصد شامل لموقف المملكة العربية السعودية من التصعيد بين إيران وإسرائيل، بما في ذلك التصريحات الرسمية، المبادرات الدبلوماسية، والإجراءات الاحترازية لحماية الأمن الوطني والإقليمي.',
  'politics',
  'active',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  updated_at = NOW();

-- التغطية 3: تحديثات الخليج والدول العربية
INSERT INTO public.live_events (
  id,
  title,
  summary,
  category,
  status,
  main_image_url,
  created_at,
  updated_at
) VALUES (
  'live-gulf-arab-response-iran-israel',
  'التغطية الحية: مواقف دول الخليج والعالم العربي من الحرب',
  'تغطية شاملة لردود فعل ومواقف دول مجلس التعاون الخليجي والدول العربية من التصعيد بين إيران وإسرائيل، مع متابعة القمم الطارئة والاجتماعات الوزارية والمبادرات العربية المشتركة.',
  'politics',
  'active',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  updated_at = NOW();

-- التغطية 4: أخبار النفط وتأثره بالأزمة
INSERT INTO public.live_events (
  id,
  title,
  summary,
  category,
  status,
  main_image_url,
  created_at,
  updated_at
) VALUES (
  'live-oil-prices-iran-israel-crisis',
  'التغطية الحية: أسعار النفط وتأثرها بأزمة الحرب',
  'متابعة حصرية لتحركات أسعار النفط العالمية وتأثرها بالتوترات بين إيران وإسرائيل، مع تحليل تداعيات الأزمة على أسواق الطاقة العالمية، إنتاج أوبك، وإمدادات النفط في منطقة الخليج.',
  'economy',
  'active',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  updated_at = NOW();

-- 3. ربط الأخبار الحالية بالتغطيات المناسبة (أمثلة)

-- ربط أخبار الحرب بالتغطية الأولى
UPDATE public.news 
SET live_event_id = 'live-israel-iran-war'
WHERE (
  LOWER(title) LIKE '%إسرائيل%' AND LOWER(title) LIKE '%إيران%'
  OR LOWER(title) LIKE '%israel%' AND LOWER(title) LIKE '%iran%'
  OR LOWER(content) LIKE '%حرب إسرائيل وإيران%'
  OR LOWER(content) LIKE '%الصراع الإسرائيلي الإيراني%'
)
AND live_event_id IS NULL;

-- ربط أخبار السعودية بالتغطية الثانية
UPDATE public.news 
SET live_event_id = 'live-saudi-position-iran-israel'
WHERE (
  (LOWER(title) LIKE '%السعودية%' OR LOWER(title) LIKE '%المملكة%')
  AND (LOWER(title) LIKE '%إيران%' OR LOWER(title) LIKE '%إسرائيل%')
)
AND live_event_id IS NULL;

-- ربط أخبار الخليج والعرب بالتغطية الثالثة
UPDATE public.news 
SET live_event_id = 'live-gulf-arab-response-iran-israel'
WHERE (
  (LOWER(title) LIKE '%الخليج%' OR LOWER(title) LIKE '%الإمارات%' OR LOWER(title) LIKE '%قطر%' OR LOWER(title) LIKE '%الكويت%' OR LOWER(title) LIKE '%البحرين%' OR LOWER(title) LIKE '%عمان%')
  AND (LOWER(title) LIKE '%إيران%' OR LOWER(title) LIKE '%إسرائيل%')
)
AND live_event_id IS NULL;

-- ربط أخبار النفط بالتغطية الرابعة
UPDATE public.news 
SET live_event_id = 'live-oil-prices-iran-israel-crisis'
WHERE (
  LOWER(title) LIKE '%النفط%' OR LOWER(title) LIKE '%أسعار النفط%' OR LOWER(title) LIKE '%برميل%' OR LOWER(title) LIKE '%أوبك%'
  OR LOWER(title) LIKE '%oil%' OR LOWER(title) LIKE '%opec%'
)
AND (
  LOWER(content) LIKE '%إيران%' OR LOWER(content) LIKE '%إسرائيل%' OR LOWER(content) LIKE '%الحرب%'
)
AND live_event_id IS NULL;

-- ============================================
-- تم الانتهاء ✅
-- يمكنك الآن تشغيل هذا السكريبت في Supabase SQL Editor
-- ============================================
