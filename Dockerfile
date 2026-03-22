# استخدام Node.js 20 Alpine كصورة أساسية
FROM node:20-alpine AS base

# تثبيت dependencies فقط عند الحاجة
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# نسخ ملفات package
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# إعادة بناء الكود المصدري فقط عند الحاجة
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تعريف build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG REVALIDATION_SECRET

# تعيين متغيرات البيئة من build arguments
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV REVALIDATION_SECRET=$REVALIDATION_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

# بناء التطبيق
RUN npm run build

# صورة الإنتاج، نسخ جميع الملفات وتشغيل next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات العامة
COPY --from=builder /app/public ./public

# إنشاء مجلد .next وتعيين الصلاحيات
RUN mkdir .next
RUN chown nextjs:nodejs .next

# نسخ ملفات البناء
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
