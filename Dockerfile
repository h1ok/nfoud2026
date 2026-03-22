# استخدام Node.js 20 Alpine كصورة أساسية
FROM node:20-alpine AS base

# تثبيت dependencies فقط عند الحاجة
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# نسخ ملفات package
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# إعادة بناء الكود المصدري فقط عند الحاجة
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تعطيل telemetry أثناء البناء
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
