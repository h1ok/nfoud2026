# دليل النشر باستخدام Docker

## المتطلبات الأساسية

قبل البناء، تأكد من وجود المتغيرات البيئية التالية:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
REVALIDATION_SECRET=your-secret-key
```

## طريقة 1: Docker Build مع Build Args

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  --build-arg REVALIDATION_SECRET=your-secret \
  -t nfoud-app .
```

ثم تشغيل:
```bash
docker run -p 3000:3000 nfoud-app
```

## طريقة 2: Docker Compose (الأسهل)

1. أنشئ ملف `.env` في نفس مجلد المشروع:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
REVALIDATION_SECRET=your-secret
```

2. شغّل:
```bash
docker-compose up --build
```

## النشر على Render

### الخطوات:

1. **اذهب إلى Render Dashboard**: https://dashboard.render.com

2. **أنشئ Web Service جديد**:
   - اختر "New" > "Web Service"
   - اربط GitHub Repository: `Mrsos07/nfoud`
   - اختر Branch: `master`

3. **إعدادات البناء**:
   - **Environment**: `Docker`
   - **Docker Command**: (اتركه فارغاً، سيستخدم CMD من Dockerfile)
   - **Region**: اختر الأقرب لك

4. **أضف Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   NEXT_PUBLIC_SITE_URL = https://your-app.onrender.com
   REVALIDATION_SECRET = your-secret-key
   ```

5. **اضغط "Create Web Service"**

### ملاحظات مهمة:

- ✅ المتغيرات البيئية **مطلوبة** أثناء البناء
- ✅ Render سيمرر المتغيرات تلقائياً كـ build args
- ✅ البناء قد يستغرق 5-10 دقائق في المرة الأولى
- ✅ بعد البناء الأول، التحديثات ستكون أسرع

## النشر على Railway

1. اذهب إلى https://railway.app
2. أنشئ مشروع جديد من GitHub
3. اختر Repository: `Mrsos07/nfoud`
4. أضف المتغيرات البيئية في Settings > Variables
5. Railway سيكتشف Dockerfile تلقائياً

## النشر على DigitalOcean App Platform

1. اذهب إلى https://cloud.digitalocean.com/apps
2. Create App > GitHub
3. اختر Repository
4. اختر Dockerfile
5. أضف Environment Variables
6. Deploy

## استكشاف الأخطاء

### خطأ: "supabaseUrl is required"
**الحل**: تأكد من تمرير المتغيرات البيئية كـ build arguments

### خطأ: "Module not found"
**الحل**: تأكد من تشغيل `npm install` قبل البناء

### البناء بطيء جداً
**الحل**: استخدم Docker layer caching أو قلل حجم الصورة

## الأمان

⚠️ **مهم جداً**:
- لا ترفع ملف `.env` إلى GitHub
- استخدم secrets management في منصة الاستضافة
- غيّر `REVALIDATION_SECRET` بشكل دوري
- استخدم HTTPS دائماً في الإنتاج
