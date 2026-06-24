-- ============================================
-- التحقق من جدول تخصصات الكُتّاب (editor_categories) وتعبئته
-- شغّل المقاطع بالترتيب في Supabase SQL Editor
-- الأقسام المتاحة: politics / economy / local / sports
-- ============================================

-- =====================
-- 1) اكتشاف بنية الجدول (اسم عمود القسم)
-- =====================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'editor_categories'
ORDER BY ordinal_position;

-- =====================
-- 2) عرض الكُتّاب مع أقسام تخصصهم الحالية
--    (عدّل اسم عمود القسم ec.category إذا أظهرت الخطوة 1 اسماً مختلفاً)
-- =====================
SELECT e.id, e.name, e.position, ec.category
FROM public.editors e
LEFT JOIN public.editor_categories ec ON ec.editor_id = e.id
ORDER BY e.name;

-- =====================
-- 3) رصد الكُتّاب بدون أي تخصص (هؤلاء سيقعون في الإسناد العشوائي)
-- =====================
SELECT e.id, e.name, e.position
FROM public.editors e
LEFT JOIN public.editor_categories ec ON ec.editor_id = e.id
WHERE ec.editor_id IS NULL
ORDER BY e.name;

-- =====================
-- 4) تعبئة تخصص لكاتب (مثال)
--    استبدل القيم بمعرّف الكاتب الفعلي والقسم المطلوب
--    يمكنك تكرار السطر لإسناد أكثر من قسم لنفس الكاتب
-- =====================
-- INSERT INTO public.editor_categories (editor_id, category)
-- VALUES ('ضع-معرّف-الكاتب-هنا', 'politics');

-- مثال: إسناد كاتب بالاسم إلى قسم الرياضة
-- INSERT INTO public.editor_categories (editor_id, category)
-- SELECT id, 'sports' FROM public.editors WHERE name = 'اسم الكاتب الرياضي';
