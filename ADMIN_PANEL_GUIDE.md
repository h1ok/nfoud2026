# دليل لوحة التحكم الإدارية - نفود الإخبارية

## 📍 الوصول إلى لوحة التحكم

### الروابط
- **صفحة تسجيل الدخول**: `/auth/login`
- **لوحة التحكم**: `/dashboard-control-panel-2025/`

## 🔐 إعداد المصادقة (Authentication)

### 1. تفعيل Supabase Auth

في لوحة تحكم Supabase:

1. اذهب إلى **Authentication** > **Providers**
2. فعّل **Email** provider
3. اذهب إلى **Authentication** > **Users**
4. أضف مستخدم جديد:
   - Email: `admin@nfoud.com`
   - Password: `اختر كلمة مرور قوية`
   - Confirm password

### 2. إنشاء أول مستخدم إداري

يمكنك إنشاء مستخدم عبر Supabase Dashboard أو SQL:

```sql
-- في Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nfoud.com',
  crypt('your-password-here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

## 📋 المميزات المتاحة

### 1. الصفحة الرئيسية (`/dashboard-control-panel-2025/`)
- ✅ إحصائيات سريعة (إجمالي الأخبار، الأحداث الحية)
- ✅ آخر الأخبار المنشورة (5 أخبار)
- ✅ إجراءات سريعة (إضافة خبر، عرض الأخبار، الإحصائيات)

### 2. إدارة الأخبار (`/dashboard-control-panel-2025/news`)
- ✅ عرض جميع الأخبار مع الصور
- ✅ البحث والفلترة
- ✅ تعديل الأخبار
- ✅ حذف الأخبار (مع تأكيد)
- ✅ معاينة الخبر في صفحة جديدة

### 3. إضافة خبر جديد (`/dashboard-control-panel-2025/news/new`)
الحقول المتاحة:
- **عنوان الخبر** * (مطلوب)
- **الرابط (Slug)** (يتم إنشاؤه تلقائياً من العنوان)
- **القسم** * (سياسة، اقتصاد، محليات، رياضة، تقنية، ثقافة)
- **المقتطف** * (ملخص قصير)
- **المحتوى** * (يدعم HTML)
- **رابط الصورة**
- **الموقع** (مثل: الرياض، السعودية)
- **وصف SEO** (160 حرف)
- **الكلمات المفتاحية** (مفصولة بفاصلة)

### 4. تعديل خبر (`/dashboard-control-panel-2025/news/edit/[id]`)
- ✅ تحميل بيانات الخبر الحالية
- ✅ تعديل جميع الحقول
- ✅ حفظ التغييرات مع تحديث `updated_at`

### 5. الإحصائيات (`/dashboard-control-panel-2025/statistics`)
- ✅ إجمالي الأخبار
- ✅ أخبار هذا الشهر
- ✅ الأحداث الحية النشطة
- ✅ الأحداث المنتهية
- ✅ توزيع الأخبار حسب القسم (مع رسم بياني)
- ✅ النشاط الأخير (آخر 10 أخبار)
- ✅ ملخص الأداء

## 🎨 واجهة المستخدم

### التصميم
- ✅ تصميم عربي كامل (RTL)
- ✅ متجاوب مع جميع الأجهزة
- ✅ قائمة تنقل ثابتة
- ✅ ألوان متناسقة مع الموقع الرئيسي
- ✅ أيقونات واضحة

### المكونات المستخدمة
- shadcn/ui components
- Radix UI primitives
- Lucide icons
- Tailwind CSS

## 🔒 الأمان

### الحماية المطبقة
1. **مصادقة Supabase**: جميع الصفحات محمية
2. **Redirect تلقائي**: المستخدمين غير المسجلين يتم توجيههم لصفحة تسجيل الدخول
3. **robots.txt**: منع فهرسة صفحات الإدارة من محركات البحث
4. **Session management**: إدارة الجلسات عبر Supabase

### الصفحات المحمية
```
/dashboard-control-panel-2025/
/auth/
/init-super-admin/
```

## 📝 استخدام لوحة التحكم

### إضافة خبر جديد

1. اذهب إلى `/dashboard-control-panel-2025/news/new`
2. املأ الحقول المطلوبة:
   - العنوان (سيتم إنشاء Slug تلقائياً)
   - اختر القسم
   - أضف المقتطف
   - أضف المحتوى (يمكن استخدام HTML)
   - أضف رابط الصورة
3. اضغط "حفظ الخبر"

### تعديل خبر موجود

1. اذهب إلى `/dashboard-control-panel-2025/news`
2. اضغط على أيقونة التعديل (قلم) بجانب الخبر
3. عدّل الحقول المطلوبة
4. اضغط "حفظ التغييرات"

### حذف خبر

1. اذهب إلى `/dashboard-control-panel-2025/news`
2. اضغط على أيقونة الحذف (سلة المهملات)
3. أكّد الحذف في النافذة المنبثقة

## 🔧 التخصيص

### إضافة أقسام جديدة

في ملفات:
- `src/app/dashboard-control-panel-2025/news/new/page.tsx`
- `src/app/dashboard-control-panel-2025/news/edit/[id]/page.tsx`

أضف القسم الجديد في Select:
```tsx
<SelectItem value="new-category">القسم الجديد</SelectItem>
```

وفي `src/app/dashboard-control-panel-2025/statistics/page.tsx`:
```tsx
const categoryLabels: Record<string, string> = {
  // ...
  'new-category': 'القسم الجديد',
};
```

### تخصيص الألوان

الألوان تأتي من `tailwind.config.ts` وتستخدم نفس نظام الألوان للموقع الرئيسي.

## 🚀 النشر

بعد إنشاء المستخدم الإداري في Supabase:

1. **تسجيل الدخول**: اذهب إلى `/auth/login`
2. **أدخل البيانات**: البريد الإلكتروني وكلمة المرور
3. **ابدأ الإدارة**: ستُنقل تلقائياً إلى لوحة التحكم

## 📊 قاعدة البيانات

### جدول `news`
```sql
- id (uuid)
- title (text)
- slug (text)
- excerpt (text)
- content (text)
- category (text)
- image_url (text)
- meta_description (text)
- keywords (text[])
- location (text)
- created_at (timestamp)
- updated_at (timestamp)
- editor_id (uuid)
- canonical_url (text)
- key_points (text[])
```

### Row Level Security (RLS)

لحماية البيانات، يمكنك تفعيل RLS في Supabase:

```sql
-- تفعيل RLS على جدول news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للجميع
CREATE POLICY "Allow public read access"
ON news FOR SELECT
TO public
USING (true);

-- السماح بالكتابة للمستخدمين المصادقين فقط
CREATE POLICY "Allow authenticated users to insert"
ON news FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update"
ON news FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete"
ON news FOR DELETE
TO authenticated
USING (true);
```

## 🆘 استكشاف الأخطاء

### لا يمكن تسجيل الدخول
1. تأكد من أن Supabase Auth مفعّل
2. تأكد من صحة البريد الإلكتروني وكلمة المرور
3. تحقق من console للأخطاء

### لا تظهر الأخبار
1. تأكد من وجود بيانات في جدول `news`
2. تحقق من اتصال Supabase
3. راجع console للأخطاء

### خطأ عند الحفظ
1. تأكد من ملء الحقول المطلوبة
2. تحقق من صلاحيات قاعدة البيانات
3. راجع console للتفاصيل

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، راجع:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

## ✨ المميزات المستقبلية

يمكن إضافة:
- [ ] رفع الصور مباشرة (Supabase Storage)
- [ ] محرر نصوص غني (Rich Text Editor)
- [ ] جدولة النشر
- [ ] إدارة التعليقات
- [ ] إدارة المحررين
- [ ] سجل التغييرات (Audit Log)
- [ ] إشعارات Push
- [ ] تصدير البيانات (CSV/Excel)
