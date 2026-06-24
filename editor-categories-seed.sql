-- ============================================
-- أداة فحص وصيانة تخصصات الكُتّاب (editor_categories)
-- تنبيه: الجدول معبّأ بالفعل — لا تشغّل أي إدراج أو حذف جماعي
-- إلا إذا أردت إعادة بناء التوزيع من الصفر.
-- الكود (getEditorIdForCategory) يقرأ هذا الجدول ويُسند تلقائياً.
-- ============================================

-- =====================
-- 1) عرض التوزيع الحالي لكل كاتب
-- =====================
SELECT e.name, e.position, ec.category
FROM public.editors e
LEFT JOIN public.editor_categories ec ON ec.editor_id = e.id
ORDER BY ec.category, e.name;

-- =====================
-- 2) التحقق من تغطية كل قسم (عدد الكُتّاب المتخصصين)
-- =====================
SELECT category, COUNT(*) AS editors_count
FROM public.editor_categories
GROUP BY category
ORDER BY category;

-- =====================
-- 3) (اختياري) إضافة فريق التحرير كاحتياطي يغطّي كل الأقسام
--    يُضاف فقط إن لم يكن موجوداً (آمن للتكرار)
-- =====================
-- INSERT INTO public.editor_categories (editor_id, category)
-- SELECT 'b94709ed-7bd7-4c43-8b98-8805e60f7371', c
-- FROM (VALUES ('politics'), ('economy'), ('local'), ('sports')) AS t(c)
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.editor_categories ec
--   WHERE ec.editor_id = 'b94709ed-7bd7-4c43-8b98-8805e60f7371' AND ec.category = t.c
-- );

-- =====================
-- 4) إسناد قسم لكاتب معيّن (آمن للتكرار)
--    غيّر المعرّف والقسم حسب الحاجة
-- =====================
-- INSERT INTO public.editor_categories (editor_id, category)
-- SELECT 'ضع-معرّف-الكاتب', 'politics'
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.editor_categories
--   WHERE editor_id = 'ضع-معرّف-الكاتب' AND category = 'politics'
-- );

-- =====================
-- 5) تحقق بعد أي تعديل
-- =====================
SELECT e.name, e.position, ec.category
FROM public.editors e
LEFT JOIN public.editor_categories ec ON ec.editor_id = e.id
ORDER BY ec.category, e.name;
