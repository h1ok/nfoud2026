# تفعيل التغطيات الحية - نفود

## ✅ تم إنشاء 4 تغطيات حية

تم إعداد نظام التغطيات الحية بالكامل مع 4 تغطيات مخصصة:

### التغطيات الأربعة:

1. **🔴 التغطية الحية: الحرب بين إسرائيل وإيران**
   - المعرّف: `live-israel-iran-war`
   - القسم: سياسية
   - الوصف: تابع آخر التطورات والأحداث الميدانية في الصراع المتصاعد بين إسرائيل وإيران

2. **🔴 التغطية الحية: موقف السعودية من الحرب بين إيران وإسرائيل**
   - المعرّف: `live-saudi-position-iran-israel`
   - القسم: سياسية
   - الوصف: رصد شامل لموقف المملكة العربية السعودية من التصعيد

3. **🔴 التغطية الحية: مواقف دول الخليج والعالم العربي من الحرب**
   - المعرّف: `live-gulf-arab-response-iran-israel`
   - القسم: سياسية
   - الوصف: تغطية شاملة لردود فعل ومواقف دول مجلس التعاون الخليجي والدول العربية

4. **🔴 التغطية الحية: أسعار النفط وتأثرها بأزمة الحرب**
   - المعرّف: `live-oil-prices-iran-israel-crisis`
   - القسم: اقتصادية
   - الوصف: متابعة حصرية لتحركات أسعار النفط العالمية وتأثرها بالتوترات

---

## 📋 خطوات التفعيل

### الخطوة 1: تشغيل السكريبت في Supabase

1. افتح لوحة تحكم Supabase الخاصة بمشروعك
2. اذهب إلى **SQL Editor**
3. افتح ملف `live-coverages-setup.sql`
4. انسخ محتوى الملف بالكامل
5. الصقه في SQL Editor
6. اضغط **Run** أو **F5**

### الخطوة 2: التحقق من نجاح العملية

بعد تشغيل السكريبت، تحقق من:

```sql
-- التحقق من إنشاء التغطيات الأربعة
SELECT id, title, status FROM live_events;

-- التحقق من إضافة عمود live_event_id لجدول news
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news' AND column_name = 'live_event_id';

-- التحقق من ربط الأخبار بالتغطيات
SELECT live_event_id, COUNT(*) as news_count 
FROM news 
WHERE live_event_id IS NOT NULL 
GROUP BY live_event_id;
```

---

## 🎯 ما تم تنفيذه

### 1. قاعدة البيانات
- ✅ إضافة عمود `live_event_id` لجدول `news`
- ✅ إنشاء 4 تغطيات حية في جدول `live_events`
- ✅ ربط الأخبار الحالية بالتغطيات المناسبة تلقائياً

### 2. الواجهة الأمامية
- ✅ صفحة عرض جميع التغطيات الحية: `/live`
- ✅ صفحة تفاصيل كل تغطية: `/live/[id]`
- ✅ مكون عرض التغطيات في الصفحة الرئيسية
- ✅ إضافة رابط "🔴 تغطيات حية" في Navbar

### 3. الأنواع والمكونات
- ✅ تحديث `LiveEvent` و `LiveEventUpdate` types
- ✅ مكون `LiveEventCard` لعرض بطاقات التغطيات
- ✅ مكون `LiveCoveragesSection` للصفحة الرئيسية

---

## 🔄 ربط الأخبار بالتغطيات

### تلقائياً:
السكريبت يربط الأخبار الحالية تلقائياً بناءً على الكلمات المفتاحية في العنوان والمحتوى.

### يدوياً:
لربط خبر معين بتغطية حية:

```sql
UPDATE news 
SET live_event_id = 'live-israel-iran-war' 
WHERE id = 'معرف_الخبر';
```

### عبر Webhook:
عند إضافة خبر جديد عبر `/api/webhook-add-news`، أضف:

```json
{
  "title": "عنوان الخبر",
  "content": "محتوى الخبر",
  "live_event_id": "live-israel-iran-war"
}
```

---

## 📱 كيفية الاستخدام

### 1. عرض التغطيات الحية
- الصفحة الرئيسية: تظهر التغطيات النشطة تلقائياً
- صفحة التغطيات: `/live`

### 2. إضافة تحديثات للتغطية الحية
استخدم جدول `live_event_updates`:

```sql
INSERT INTO live_event_updates (
  live_event_id,
  content,
  update_type,
  source_news_id
) VALUES (
  'live-israel-iran-war',
  '<p>تحديث جديد: ...</p>',
  'breaking',
  NULL
);
```

### 3. تغيير حالة التغطية

```sql
-- إنهاء تغطية
UPDATE live_events 
SET status = 'ended', updated_at = NOW() 
WHERE id = 'live-israel-iran-war';

-- تفعيل تغطية
UPDATE live_events 
SET status = 'active', updated_at = NOW() 
WHERE id = 'live-israel-iran-war';
```

---

## 🎨 التخصيص

### تغيير عنوان أو وصف التغطية:

```sql
UPDATE live_events 
SET 
  title = 'عنوان جديد',
  summary = 'وصف جديد',
  updated_at = NOW()
WHERE id = 'live-israel-iran-war';
```

### إضافة صورة للتغطية:

```sql
UPDATE live_events 
SET main_image_url = 'https://example.com/image.jpg'
WHERE id = 'live-israel-iran-war';
```

---

## 🚀 الميزات

- ✅ عرض تلقائي للتغطيات النشطة في الصفحة الرئيسية
- ✅ رابط بارز في Navbar مع emoji 🔴
- ✅ تصميم احترافي مع أنيميشن للتغطيات المباشرة
- ✅ ربط تلقائي للأخبار بالتغطيات المناسبة
- ✅ نظام تحديثات لحظية لكل تغطية
- ✅ دعم حالات متعددة: active, ended, archived

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من تشغيل السكريبت بنجاح
2. تحقق من صلاحيات RLS في Supabase
3. راجع console logs في المتصفح

---

**تم إنشاء النظام بالكامل وجاهز للاستخدام! 🎉**
