# TrendZone 🚀

> **اركب الترند قبل منافسيك** — منصة SaaS تكتشف الترندات التجارية مبكراً وتجهّز المحتوى العربي الجاهز للنشر

---

## 🌟 نظرة عامة | Overview

TrendZone هي منصة ذكاء اصطناعي للمتاجر الإلكترونية في الخليج تكتشف الترندات التجارية قبل انتشارها بـ 24-48 ساعة وتولّد المحتوى الجاهز للنشر تلقائياً.

**TrendZone** is an AI-powered SaaS platform for Gulf e-commerce stores. It detects commercial trends 24-48 hours before they peak and auto-generates ready-to-publish Arabic content.

---

## ✨ المميزات | Features

- 🔍 **رصد الترندات** من 5+ مصادر (Google Trends, Reddit, Pinterest, TikTok, Instagram)
- 🤖 **AI Engine** يصنّف ويتوقع مسار كل ترند
- 📝 **محتوى جاهز** للنشر على Instagram, Snapchat, TikTok, SEO, WhatsApp
- 🔔 **تنبيهات فورية** عبر واتساب، إيميل، ونوتيفيكيشن
- 👥 **مطابقة المؤثرين** المناسبين لكل ترند تلقائياً
- 💳 **اشتراكات Stripe** بثلاث باقات

---

## 🛠 التقنيات | Tech Stack

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 14 (App Router) | الإطار الرئيسي |
| TypeScript | لغة البرمجة |
| Tailwind CSS | التصميم |
| Supabase | Auth + Realtime |
| Prisma + PostgreSQL | قاعدة البيانات |
| OpenAI GPT-4o | تصنيف وتوقع الترندات |
| Anthropic Claude | توليد المحتوى العربي |
| Stripe | نظام الاشتراكات |
| Resend | إرسال الإيميلات |
| Twilio | WhatsApp notifications |
| Upstash Redis | Caching + Rate limiting |
| Sentry | Error tracking |
| Vercel | Deploy |

---

## 🚀 تشغيل المشروع محلياً | Local Setup

### المتطلبات | Prerequisites

- Node.js 20+
- npm أو pnpm
- حساب Supabase
- حساب Stripe (للاشتراكات)

### الخطوات | Steps

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-org/trendzone.git
cd trendzone

# 2. تثبيت المكتبات
npm install

# 3. نسخ ملف البيئة
cp .env.example .env.local
# ثم افتح .env.local وعبّئ كل المتغيرات

# 4. إعداد قاعدة البيانات
npm run db:push       # تطبيق الـ schema
npm run db:seed       # إضافة بيانات تجريبية

# 5. تشغيل سيرفر التطوير
npm run dev
```

ثم افتح [http://localhost:3000](http://localhost:3000)

---

## ⚙️ متغيرات البيئة | Environment Variables

انسخ `.env.example` إلى `.env.local` وعبّئ المتغيرات التالية:

### الضرورية (يتوقف التطبيق بدونها)

| المتغير | الوصف |
|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العام لـ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخادم لـ Supabase |
| `DATABASE_URL` | رابط قاعدة البيانات PostgreSQL |
| `DIRECT_URL` | رابط مباشر لـ Prisma migrations |
| `OPENAI_API_KEY` | مفتاح OpenAI API |
| `ANTHROPIC_API_KEY` | مفتاح Anthropic API |

### الاشتراكات (للدفع)

| المتغير | الوصف |
|---------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | المفتاح العام لـ Stripe |
| `STRIPE_SECRET_KEY` | المفتاح السري لـ Stripe |
| `STRIPE_WEBHOOK_SECRET` | سر الـ Webhook |
| `STRIPE_PRICE_STARTER` | Price ID لباقة Starter |
| `STRIPE_PRICE_GROWTH` | Price ID لباقة Growth |
| `STRIPE_PRICE_ENTERPRISE` | Price ID لباقة Enterprise |

### الإشعارات (اختيارية)

| المتغير | الوصف |
|---------|-------|
| `RESEND_API_KEY` | إرسال الإيميلات عبر Resend |
| `TWILIO_ACCOUNT_SID` | تنبيهات WhatsApp عبر Twilio |
| `TWILIO_AUTH_TOKEN` | مصادقة Twilio |
| `TWILIO_WHATSAPP_FROM` | رقم WhatsApp Business |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push (المفتاح العام) |
| `VAPID_PRIVATE_KEY` | Web Push (المفتاح الخاص) |

### الأداء والمراقبة

| المتغير | الوصف |
|---------|-------|
| `UPSTASH_REDIS_REST_URL` | Redis للـ caching |
| `UPSTASH_REDIS_REST_TOKEN` | مصادقة Upstash |
| `NEXT_PUBLIC_SENTRY_DSN` | تتبع الأخطاء |
| `CRON_SECRET` | حماية Cron Jobs |

---

## 📁 هيكل المشروع | Project Structure

```
trendzone/
├── app/
│   ├── (auth)/              # صفحات تسجيل الدخول والتسجيل
│   ├── (dashboard)/         # لوحة التحكم المحمية
│   │   ├── dashboard/       # الصفحة الرئيسية
│   │   ├── trends/          # الترندات + [id]
│   │   ├── content/         # المحتوى الجاهز
│   │   ├── alerts/          # التنبيهات
│   │   ├── influencers/     # المؤثرون + [id]
│   │   └── settings/        # الإعدادات
│   ├── (onboarding)/        # خطوات الإعداد الأولي
│   ├── api/                 # API Routes
│   │   ├── ai/              # AI generation
│   │   ├── alerts/          # التنبيهات
│   │   ├── content/         # المحتوى
│   │   ├── cron/            # Cron Jobs
│   │   ├── notifications/   # Push subscriptions
│   │   ├── stripe/          # Checkout + Portal
│   │   ├── trends/          # الترندات
│   │   ├── user/            # بيانات المستخدم
│   │   └── webhooks/        # Stripe webhooks
│   ├── pricing/             # صفحة الأسعار
│   ├── error.tsx            # صفحة الخطأ العامة
│   └── not-found.tsx        # صفحة 404
├── components/
│   ├── alerts/              # مكونات التنبيهات
│   ├── auth/                # مكونات المصادقة
│   ├── billing/             # مكونات الفواتير
│   ├── content/             # مكونات المحتوى
│   ├── dashboard/           # مكونات لوحة التحكم
│   ├── influencers/         # مكونات المؤثرين ✨ جديد
│   ├── onboarding/          # مكونات الإعداد
│   ├── settings/            # مكونات الإعدادات
│   ├── trends/              # مكونات الترندات
│   └── ui/                  # shadcn/ui components
├── hooks/                   # React hooks
├── lib/
│   ├── ai/                  # AI Engine
│   ├── api/                 # Rate limiting
│   ├── auth/                # Auth helpers
│   ├── cache/               # Redis caching ✨ جديد
│   ├── collectors/          # جمع البيانات
│   ├── notifications/       # Email + WhatsApp + Push ✨ جديد
│   ├── stripe/              # Stripe helpers
│   └── supabase/            # Supabase clients
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── public/
│   └── sw.js                # Service Worker ✨ جديد
├── types/                   # TypeScript types
├── sentry.client.config.ts  # Sentry client ✨ جديد
├── sentry.server.config.ts  # Sentry server ✨ جديد
└── vercel.json              # Deploy config
```

---

## 🗄 قاعدة البيانات | Database

```bash
# توليد Prisma Client
npm run db:generate

# تطبيق schema على DB
npm run db:push

# إنشاء migration جديد
npm run db:migrate

# إضافة بيانات تجريبية
npm run db:seed

# فتح Prisma Studio
npm run db:studio
```

---

## 🚢 النشر | Deployment

### Vercel (الموصى به)

```bash
# 1. ادفع الكود لـ GitHub
git push origin main

# 2. اربط المشروع بـ Vercel
vercel --prod

# 3. أضف متغيرات البيئة من Vercel Dashboard

# 4. فعّل Cron Jobs (مُكوَّنة تلقائياً في vercel.json)
```

### Cron Jobs المجدولة

| المسار | الجدول | الوظيفة |
|--------|--------|---------|
| `/api/cron/collect-trends` | كل ساعة | جمع الترندات |
| `/api/cron/analyze-trends` | كل ساعتين | تحليل الترندات |
| `/api/cron/send-alerts` | كل 30 دقيقة | إرسال التنبيهات |

---

## 💳 باقات الاشتراك | Subscription Plans

| الباقة | السعر | المميزات |
|--------|-------|---------|
| **Starter** | 99 ر.س/شهر | 50 ترند/شهر، تنبيهات إيميل |
| **Growth** | 249 ر.س/شهر | ترندات غير محدودة، واتساب، جدولة محتوى |
| **Enterprise** | 699 ر.س/شهر | API Access، Webhook، حملات مشتركة |

---

## 🤝 المساهمة | Contributing

1. Fork المشروع
2. أنشئ branch جديد: `git checkout -b feature/your-feature`
3. Commit تغييراتك: `git commit -m 'Add: your feature'`
4. Push: `git push origin feature/your-feature`
5. افتح Pull Request

---

## 📄 الترخيص | License

MIT © 2025 TrendZone

---

*TrendZone — اركب الموجة قبل غيرك* 🌊
