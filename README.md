# منظم - نظام الذكاء الاصطناعي للإدارة التنفيذية

![منظم](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

## نظرة عامة

**منظم** هو نظام ذكاء اصطناعي متكامل لإدارة الأعمال التنفيذية، يستخدم تقنيات الذكاء الاصطناعي المتقدمة لتحليل الاجتماعات والمقابلات، استخراج المهام، وتقديم توصيات مبنية على أفضل الممارسات الإدارية.

## المزايا الرئيسية

### 1. تحليل الاجتماعات الذكي
- **تفريغ تلقائي** للتسجيلات الصوتية والمرئية
- **ملخص تنفيذي** فوري ومختصر
- **استخراج القرارات** مع تحديد المسؤولين والمواعيد
- **كشف الكلام الفارغ** والنقاشات غير المنتجة
- **تحديد المخاطر** والفرص
- **توصيات مبنية** على أفضل الممارسات من 14 كتاب إداري

### 2. تقييم المقابلات الوظيفية
- **تحليل سلوكي** متقدم (الصدق، الثقة، التردد)
- **تقييم بناءً على** منهجيات Topgrading و Who
- **كشف التناقضات** في إجابات المرشح
- **تقييم STAR** (Situation, Task, Action, Result)
- **توصية نهائية** مبررة (تعيين / لا تعيين)

### 3. إدارة المهام التلقائية
- **استخراج تلقائي** للمهام من الاجتماعات
- **تحديد الأولويات** (عاجل، مرتفع، متوسط، منخفض)
- **تتبع الإنجاز** مع لوحة كانبان
- **ربط المهام** بمصادرها (اجتماعات، إيميلات)

### 4. نظام RAG (Retrieval-Augmented Generation)
- **قاعدة معرفية** تحتوي على 14 كتاب في الإدارة والموارد البشرية
- **تحليل مبني** على أفضل الممارسات العالمية
- **توصيات ذكية** مستمدة من خبرات إدارية موثوقة

### 5. المساعد الصباحي (Daily Briefing)
- **ملخص يومي ذكي** للمهام والاجتماعات
- **إحصائيات الإنجاز** (معدل الإكمال، المهام العاجلة)
- **توصيات يومية** مخصصة بناءً على نشاطك
- **عرض النشاط الأخير** (اجتماعات، مقابلات، مهام)

### 6. التكامل مع الخدمات الخارجية
- **Google Calendar**: مزامنة الاجتماعات من تقويم Google
- **Gmail**: تحليل الإيميلات واستخراج المهام تلقائيًا
- **Outlook Calendar**: مزامنة الاجتماعات من Outlook
- **Outlook Email**: تحليل إيميلات Outlook واستخراج المهام
- **استخراج المهام بالذكاء الاصطناعي**: تحليل الإيميلات وتحديد الإجراءات المطلوبة

## التقنيات المستخدمة

### Backend
- **Node.js** + **Express** - خادم التطبيق
- **tRPC** - Type-safe API
- **Drizzle ORM** - إدارة قاعدة البيانات
- **MySQL/TiDB** - قاعدة البيانات
- **Manus AI Platform** - خدمات الذكاء الاصطناعي

### Frontend
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Tailwind CSS 4** - تصميم الواجهة
- **shadcn/ui** - مكونات الواجهة
- **Wouter** - التوجيه

### AI Services
- **DeepSeek / OpenAI** - نماذج اللغة الكبيرة
- **Whisper API** - تحويل الصوت إلى نص
- **RAG System** - استرجاع المعلومات المعززة

## البنية المعمارية

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Dashboard │ Meetings │ Interviews │ Tasks              │
└────────────────────────┬────────────────────────────────┘
                         │ tRPC
┌────────────────────────┴────────────────────────────────┐
│                   Backend (Express)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routers    │  │   Services   │  │  Background  │  │
│  │   (tRPC)     │  │   (AI/RAG)   │  │   Worker     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
   │  MySQL  │     │   S3    │     │   AI    │
   │Database │     │ Storage │     │ Services│
   └─────────┘     └─────────┘     └─────────┘
```

## التثبيت والتشغيل

### المتطلبات
- Node.js 20+
- pnpm
- MySQL/MariaDB
- حساب Manus Platform

### التثبيت المحلي
```bash
# استنساخ المشروع
git clone <repository-url>
cd munazzam

# تثبيت التبعيات
pnpm install

# إعداد قاعدة البيانات
pnpm db:push

# تشغيل التطبيق
pnpm dev
```

### إعداد OAuth (اختياري)

لتفعيل التكامل مع Google و Microsoft:

1. اتبع التعليمات في `OAUTH_SETUP.md`
2. أضف بيانات الاعتماد إلى متغيرات البيئة:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/oauth/google/callback
   
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   MICROSOFT_REDIRECT_URI=https://your-domain.com/api/oauth/microsoft/callback
   ```

⚠️ **ملاحظة**: التكامل مع Google/Microsoft اختياري. يمكن استخدام النظام بدونه.

### النشر على VPS
راجع ملف [DEPLOYMENT.md](./DEPLOYMENT.md) للتعليمات الكاملة.

## الهيكل التنظيمي

```
munazzam/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── components/    # مكونات قابلة لإعادة الاستخدام
│   │   ├── lib/           # مكتبات مساعدة
│   │   └── hooks/         # React hooks
│   └── public/            # ملفات ثابتة
├── server/                # Backend Node.js
│   ├── services/          # خدمات الأعمال
│   │   ├── rag.ts        # نظام RAG
│   │   ├── meetingAnalysis.ts
│   │   ├── interviewAnalysis.ts
│   │   └── backgroundWorker.ts
│   ├── routers.ts        # tRPC routers
│   └── db.ts             # قاعدة البيانات
├── drizzle/              # Database schema
├── knowledge_base/       # الكتب PDF (14 كتاب)
│   ├── Business_Productivity/
│   └── HR_Exclusive/
└── shared/               # كود مشترك
```

## قاعدة البيانات

### الجداول الرئيسية
- **users** - المستخدمون
- **meetings** - الاجتماعات والتحليلات
- **interviews** - المقابلات والتقييمات
- **tasks** - المهام المستخرجة
- **jobs** - طابور المعالجة الخلفية
- **briefings** - الملخصات اليومية
- **integrations** - تكاملات Google/Microsoft
- **calendar_events** - أحداث التقويم المزامنة
- **emails** - الإيميلات المزامنة والمحللة

## API Documentation

### Meetings
```typescript
// إنشاء اجتماع
trpc.meetings.create.useMutation({
  title: string,
  description?: string,
  fileData?: string,  // base64
  fileName?: string,
  fileType?: string
})

// عرض الاجتماعات
trpc.meetings.list.useQuery()

// عرض اجتماع محدد
trpc.meetings.get.useQuery({ id: number })
```

### Interviews
```typescript
// إنشاء مقابلة
trpc.interviews.create.useMutation({
  candidateName: string,
  position?: string,
  fileData?: string,
  fileName?: string,
  fileType?: string
})

// عرض المقابلات
trpc.interviews.list.useQuery()
```

### Tasks
```typescript
// عرض المهام
trpc.tasks.list.useQuery()

// تحديث مهمة
trpc.tasks.update.useMutation({
  id: number,
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled',
  priority?: 'low' | 'medium' | 'high' | 'urgent'
})
```

## الاختبارات

```bash
# تشغيل الاختبارات
pnpm test

# تشغيل الاختبارات مع التغطية
pnpm test:coverage
```

## المساهمة

هذا مشروع خاص. للاستفسارات، يرجى التواصل مع المالك.

## الترخيص

جميع الحقوق محفوظة © 2024

## الدعم

للدعم الفني، يرجى التواصل عبر:
- البريد الإلكتروني: support@munazzam.com
- الموقع: https://munazzam.com

---

**ملاحظة**: هذا النظام مُصمم للاستخدام التجاري ويتطلب اشتراك في Manus Platform.
