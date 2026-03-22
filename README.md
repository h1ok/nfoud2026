# شبكة نفود الإخبارية - Next.js

> موقع إخباري احترافي مبني بـ Next.js 16 مع App Router، SSR/ISR، وتحسينات SEO متقدمة

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.75-3ecf8e)](https://supabase.com/)

## SEO Optimizations Applied

This project includes comprehensive SEO and performance optimizations:
- Image optimization (AVIF, WebP, lazy loading)
- Core Web Vitals improvements
- Enhanced internal linking with breadcrumbs
- Structured data (Schema.org)
- Comprehensive caching strategy
- RSS feed and sitemap
- PWA manifest
- Security headers

See `SEO_OPTIMIZATION_GUIDE.md` and `QUICK_START_SEO.md` for details.

## المميزات

### 🚀 الأداء
- **Server-Side Rendering (SSR)** للصفحات الديناميكية
- **Incremental Static Regeneration (ISR)** مع revalidate كل 60 ثانية
- **Image Optimization** تلقائي (AVIF/WebP)
- **Code Splitting** تلقائي
- **Compression** مفعّل (Gzip/Brotli)

### 🔍 SEO
- **Metadata API** ديناميكي لكل صفحة
- **Sitemap.xml** ديناميكي
- **RSS Feed** تلقائي
- **robots.txt** محسّن
- **Structured Data** (JSON-LD) لـ NewsArticle
- **Open Graph** و **Twitter Cards**
- دعم كامل للغة العربية (RTL)

### 🎨 التصميم
- **Tailwind CSS 4** للتنسيق
- **shadcn/ui** للمكونات
- **Radix UI** للعناصر التفاعلية
- **Lucide Icons** للأيقونات
- **Cairo Font** للخط العربي
- تصميم متجاوب (Mobile-First)

### 🔐 الأمان
- **HTTPS** إجباري
- **Security Headers** مُطبقة
- **Environment Variables** آمنة
- **DOMPurify** لتنظيف HTML

## 📁 هيكل المشروع

```
nfoud-nextjs/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx         # Layout رئيسي
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── article/[slug]/    # صفحة المقال
│   │   ├── politics/          # قسم السياسة
│   │   ├── economy/           # قسم الاقتصاد
│   │   ├── local/             # قسم المحليات
│   │   ├── sports/            # قسم الرياضة
│   │   ├── live/              # الأحداث الحية
│   │   ├── about/             # من نحن
│   │   ├── contact/           # اتصل بنا
│   │   ├── sitemap.ts         # Sitemap ديناميكي
│   │   ├── robots.ts          # robots.txt
│   │   └── rss.xml/           # RSS Feed
│   ├── components/            # المكونات
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── NewsCard.tsx
│   │   ├── LiveEventCard.tsx
│   │   └── ui/                # مكونات UI
│   ├── lib/                   # المكتبات المساعدة
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts           # دوال مساعدة
│   │   └── constants.ts       # الثوابت
│   └── types/                 # أنواع TypeScript
│       └── news.ts
├── public/                    # الملفات الثابتة
├── env.template              # قالب متغيرات البيئة
├── next.config.ts            # تكوين Next.js
├── tailwind.config.ts        # تكوين Tailwind
├── QUICK_START.md            # دليل البدء السريع
├── MIGRATION_GUIDE.md        # دليل التحويل
└── DEPLOYMENT_GUIDE.md       # دليل النشر الكامل
```

## 🚀 البدء السريع

### 1. نسخ ملف البيئة
```bash
cp env.template .env.local
```

### 2. تثبيت المكتبات
```bash
npm install --legacy-peer-deps
```

### 3. تشغيل المشروع
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## 📝 الأوامر المتاحة

```bash
# تطوير
npm run dev          # تشغيل بيئة التطوير

# إنتاج
npm run build        # بناء للإنتاج
npm start            # تشغيل نسخة الإنتاج

# أدوات
npm run lint         # فحص الأخطاء
```

## 🌍 متغيرات البيئة

أنشئ ملف `.env.local` بالمتغيرات التالية:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vraxaknyauqlnyardhla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://nfoud.com
```

## 📄 الصفحات المتاحة

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | آخر الأخبار والأحداث الحية |
| المقال | `/article/[slug]` | صفحة المقال الكاملة |
| السياسة | `/politics` | أخبار سياسية |
| الاقتصاد | `/economy` | أخبار اقتصادية |
| المحليات | `/local` | أخبار محلية |
| الرياضة | `/sports` | أخبار رياضية |
| الأحداث الحية | `/live` | تغطيات مباشرة |
| حدث مباشر | `/live/[id]` | صفحة الحدث المباشر |
| جميع الأخبار | `/all-news` | كل الأخبار |
| من نحن | `/about` | عن الموقع |
| اتصل بنا | `/contact` | معلومات التواصل |

## 🔧 التقنيات المستخدمة

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Date**: date-fns
- **Sanitization**: isomorphic-dompurify

## 📊 تحسينات الأداء

### ISR (Incremental Static Regeneration)
```typescript
export const revalidate = 60; // إعادة التحقق كل 60 ثانية
```

### Image Optimization
```typescript
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [...]
}
```

### Server Components
جميع الصفحات Server Components افتراضياً لتقليل JavaScript المرسل للعميل

## 🔍 SEO Features

### Dynamic Metadata
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // Metadata ديناميكي لكل صفحة
}
```

### Structured Data
```typescript
// JSON-LD Schema لـ NewsArticle
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  ...
}
```

### Sitemap & RSS
- `/sitemap.xml` - Sitemap ديناميكي
- `/rss.xml` - RSS Feed تلقائي
- `/robots.txt` - محسّن لمحركات البحث

## 🚀 النشر

### Vercel (موصى به)
```bash
# عبر GitHub
1. ادفع الكود إلى GitHub
2. اربط المشروع في Vercel
3. أضف متغيرات البيئة
4. انشر!

# عبر CLI
vercel --prod
```

راجع [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) للتفاصيل الكاملة

## 📚 المستندات

- **[QUICK_START.md](./QUICK_START.md)** - ابدأ في 5 دقائق
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - دليل التحويل من Vite
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - النشر الكامل

## 🐛 حل المشاكل

### الصور لا تظهر
تحقق من `next.config.ts` و `.env.local`

### خطأ في التثبيت
```bash
npm install --legacy-peer-deps
```

### خطأ في البناء
```bash
rm -rf .next
npm run build
```

## 📞 الدعم

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 شبكة نفود الإخبارية

---

**تم التحويل من Vite + React SPA إلى Next.js SSR/ISR بنجاح ✅**
