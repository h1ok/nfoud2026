# إعداد Supabase لمشروع نفود الإخبارية

## المشكلة الشائعة: "تعذّر جلب الأخبار"

إذا ظهرت رسالة "تعذّر جلب الأخبار" في الشريط الإخباري، السبب الأكثر احتمالاً هو **Row Level Security (RLS)** في Supabase.

## الحل السريع

### 1. افتح Supabase Dashboard
اذهب إلى: https://supabase.com/dashboard/project/wqcikbeglxfptnaamnpj

### 2. افتح SQL Editor
من القائمة الجانبية، اختر **SQL Editor**

### 3. نفّذ الأمر التالي

```sql
-- تعطيل RLS مؤقتاً للاختبار (غير آمن للإنتاج)
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_event_updates DISABLE ROW LEVEL SECURITY;
```

### 4. اختبر الموقع
إذا عمل الشريط الإخباري، فالمشكلة كانت في RLS.

---

## الحل الآمن (للإنتاج)

بدلاً من تعطيل RLS، استخدم Policies:

### الخطوة 1: تفعيل RLS مع Policies

```sql
-- تفعيل RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_event_updates ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للجميع (public)
CREATE POLICY "Allow public read access to news"
ON news FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to live_events"
ON live_events FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to live_event_updates"
ON live_event_updates FOR SELECT TO public USING (true);

-- السماح بالكتابة للمستخدمين المصادقين فقط
CREATE POLICY "Allow authenticated users to manage news"
ON news FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage live_events"
ON live_events FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage live_event_updates"
ON live_event_updates FOR ALL TO authenticated USING (true);
```

---

## التحقق من RLS

### طريقة 1: من Dashboard

1. اذهب إلى **Authentication** > **Policies**
2. اختر جدول `news`
3. تحقق من وجود Policy للقراءة العامة

### طريقة 2: من SQL

```sql
-- عرض جميع Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('news', 'live_events', 'live_event_updates');
```

---

## حذف Policies القديمة (إذا لزم الأمر)

```sql
-- حذف جميع policies من جدول news
DROP POLICY IF EXISTS "Allow public read access to news" ON news;
DROP POLICY IF EXISTS "Allow authenticated users to manage news" ON news;

-- ثم أنشئ policies جديدة
```

---

## الأخطاء الشائعة

### خطأ: "new row violates row-level security policy"
**الحل**: تأكد من وجود policy للـ INSERT للمستخدمين المصادقين

### خطأ: "permission denied for table news"
**الحل**: تأكد من أن anon role له صلاحيات SELECT على الجدول

```sql
GRANT SELECT ON news TO anon;
GRANT SELECT ON live_events TO anon;
GRANT SELECT ON live_event_updates TO anon;
```

---

## التحقق من الصلاحيات

```sql
-- عرض صلاحيات anon role
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_name IN ('news', 'live_events', 'live_event_updates');
```

---

## ملاحظات مهمة

1. ✅ **anon key** يستخدم للقراءة العامة (Frontend)
2. ✅ **service_role key** يستخدم للعمليات الإدارية (Backend فقط)
3. ⚠️ لا تستخدم service_role key في Frontend أبداً
4. ✅ RLS يجب أن يكون مفعّل في الإنتاج مع policies صحيحة
5. ✅ للاختبار السريع، يمكن تعطيل RLS مؤقتاً

---

## اختبار الاتصال

يمكنك اختبار الاتصال بـ Supabase من المتصفح:

```javascript
// افتح Console في المتصفح (F12)
// الصق هذا الكود:

const { createClient } = supabase;
const supabaseUrl = 'https://wqcikbeglxfptnaamnpj.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY_HERE'; // من Environment Variables

const client = createClient(supabaseUrl, supabaseKey);

// جرب جلب البيانات
const { data, error } = await client.from('news').select('*').limit(5);
console.log('Data:', data);
console.log('Error:', error);
```

إذا ظهر خطأ، ستجد التفاصيل في `error.message`.
