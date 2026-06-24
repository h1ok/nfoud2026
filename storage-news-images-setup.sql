-- ============================================
-- إعداد bucket تخزين صور الأخبار (news-images)
-- شغّل هذا الكود في Supabase SQL Editor
-- يتيح رفع الصور من نموذج "إضافة خبر جديد" في لوحة التحكم
-- ============================================

-- =====================
-- 1) إنشاء bucket عام للصور (إن لم يكن موجوداً)
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================
-- 2) سياسات الوصول
-- =====================
-- قراءة عامة للصور
DROP POLICY IF EXISTS "news_images_public_read" ON storage.objects;
CREATE POLICY "news_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

-- السماح بالرفع (INSERT) — anon + authenticated
-- ملاحظة: نموذج الإضافة يستخدم مفتاح anon من المتصفح،
-- لذا نسمح للدور anon بالرفع في هذا الـ bucket فقط.
DROP POLICY IF EXISTS "news_images_insert" ON storage.objects;
CREATE POLICY "news_images_insert" ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'news-images');

-- (اختياري) السماح بالتحديث والحذف لنفس الدور
DROP POLICY IF EXISTS "news_images_update" ON storage.objects;
CREATE POLICY "news_images_update" ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "news_images_delete" ON storage.objects;
CREATE POLICY "news_images_delete" ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'news-images');

-- ============================================
-- تم ✅ — يمكنك الآن رفع الصور من لوحة التحكم
-- تنبيه أمني: السماح للدور anon بالرفع يعني أن أي شخص لديه
-- مفتاح anon يستطيع الرفع. لوحة التحكم محمية بمسار سري،
-- لكن إن أردت أماناً أعلى انقل الرفع إلى مسار API بمفتاح الخدمة.
-- ============================================
