# منظّم (Munazzam)

مساعد معرفي بالذكاء الاصطناعي لإدارة الإنتاجية والموارد البشرية

## 📋 نظرة عامة

**منظّم** هو تطبيق ويب متقدم يستخدم الذكاء الاصطناعي لتحويل الاتصالات المهنية إلى رؤى قابلة للتنفيذ. يقوم التطبيق بقراءة وفهم وتحليل رسائل البريد الإلكتروني والاجتماعات، ويقدم تحليلات عميقة للمقابلات الوظيفية.

## ✨ الميزات الرئيسية

### للجميع:
- ✅ **صندوق الوارد المعرفي**: تحليل رسائل البريد للكشف عن طلبات الاجتماعات
- ✅ **الجدولة التلقائية**: اقتراح مواعيد مناسبة تلقائياً
- ✅ **التقويم الموحد**: دمج Google Calendar و Outlook
- ✅ **تسجيل الاجتماعات**: تسجيل وتحليل الاجتماعات الحضورية والافتراضية

### منظّم أعمال:
- ✅ **مساعد الاجتماعات الافتراضية**: الانضمام التلقائي للاجتماعات (Zoom, Meet, Teams)
- ✅ **التحليل الفوري**: تحويل الصوت إلى نص وتحليل المحتوى
- ✅ **التقارير الذكية**: استخراج القرارات والمهام والمسؤوليات

### منظّم الموارد البشرية:
- ✅ **تحليل المقابلات**: تحليل شامل للمقابلات الوظيفية
- ✅ **التحليل السلوكي الصوتي**: قياس سرعة الكلام، الثقة، والوضوح
- ✅ **التحليل القائم على المعرفة (RAG)**: رؤى مبنية على أفضل الممارسات
- ✅ **بطاقة الأداء**: تقييم المرشحين بناءً على كفاءات محددة

## 🏗️ البنية التقنية

### Frontend
- **React 18** - مكتبة واجهة المستخدم
- **Vite** - أداة البناء السريعة
- **Tailwind CSS** - إطار عمل CSS
- **React Router** - التنقل بين الصفحات
- **Axios** - طلبات HTTP
- **Lucide React** - الأيقونات

### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **MongoDB** - قاعدة البيانات الرئيسية
- **Mongoose** - ODM لـ MongoDB
- **JWT** - المصادقة والتفويض

### الذكاء الاصطناعي
- **OpenAI GPT-4** - التحليل والاستنتاج
- **Whisper API** - تحويل الصوت إلى نص
- **LangChain** - إطار عمل RAG (قيد التطوير)
- **ChromaDB** - قاعدة بيانات متجهة (قيد التطوير)

### التكاملات
- **Google OAuth2** - تسجيل الدخول والتكامل
- **Microsoft OAuth2** - تسجيل الدخول والتكامل
- **Google Calendar API** - مزامنة التقويم
- **Gmail API** - قراءة البريد الإلكتروني

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js 18+ و npm
- MongoDB 5+
- حساب OpenAI API
- حسابات Google/Microsoft Developer (اختياري)

### 1. استنساخ المشروع
```bash
git clone https://github.com/amhr0/Munazzam.git
cd Munazzam
```

### 2. إعداد Backend

```bash
cd server

# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env

# تعديل ملف .env وإضافة المفاتيح المطلوبة
# MONGODB_URI=mongodb://localhost:27017/munazzam
# JWT_SECRET=your-secret-key
# OPENAI_API_KEY=your-openai-key
# ... إلخ

# تشغيل الخادم
npm run dev
```

### 3. إعداد Frontend

```bash
cd ../client

# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env

# تعديل ملف .env
# VITE_API_URL=http://localhost:5000/api

# تشغيل التطبيق
npm run dev
```

### 4. الوصول للتطبيق

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔑 إعداد API Keys

### OpenAI API Key
1. سجل في https://platform.openai.com
2. أنشئ API Key جديد
3. أضفه في `.env` كـ `OPENAI_API_KEY`

### Google OAuth2 & APIs
1. اذهب إلى https://console.cloud.google.com
2. أنشئ مشروع جديد
3. فعّل Google Calendar API و Gmail API
4. أنشئ OAuth 2.0 credentials
5. أضف Redirect URI: `http://localhost:5000/api/auth/google/callback`
6. أضف المفاتيح في `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Microsoft OAuth2
1. اذهب إلى https://portal.azure.com
2. سجل تطبيق جديد في Azure AD
3. أضف Redirect URI: `http://localhost:5000/api/auth/microsoft/callback`
4. أضف المفاتيح في `.env`:
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`

## 📁 هيكل المشروع

```
munazzam/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── contexts/      # React Contexts
│   │   ├── services/      # خدمات API
│   │   └── App.jsx        # المكون الرئيسي
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js Backend
│   ├── models/           # نماذج MongoDB
│   ├── routes/           # مسارات API
│   ├── services/         # خدمات الأعمال
│   ├── middleware/       # Middleware
│   ├── server.js         # نقطة الدخول
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - إنشاء حساب جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي

### Meetings
- `GET /api/meetings` - الحصول على جميع الاجتماعات
- `POST /api/meetings` - إنشاء اجتماع جديد
- `GET /api/meetings/:id` - الحصول على اجتماع محدد
- `PATCH /api/meetings/:id` - تحديث اجتماع
- `DELETE /api/meetings/:id` - حذف اجتماع
- `POST /api/meetings/:id/recording` - رفع تسجيل صوتي
- `POST /api/meetings/:id/analyze` - تحليل اجتماع
- `PATCH /api/meetings/:id/scorecard` - تحديث بطاقة الأداء

### Calendar
- `GET /api/calendar/events` - الحصول على الأحداث
- `POST /api/calendar/events` - إنشاء حدث جديد
- `POST /api/calendar/sync/google` - مزامنة Google Calendar
- `POST /api/calendar/sync/microsoft` - مزامنة Microsoft Calendar
- `GET /api/calendar/available-slots` - البحث عن أوقات فارغة

### Email
- `POST /api/email/fetch` - جلب وتحليل رسائل البريد
- `GET /api/email/meeting-requests` - الحصول على طلبات الاجتماعات
- `POST /api/email/reply/:emailId` - إرسال رد
- `PATCH /api/email/:emailId/process` - تحديد حالة البريد

## 🎯 الاستخدام

### 1. إنشاء حساب
- اختر نوع الحساب: **منظّم أعمال** أو **منظّم للموارد البشرية**
- أدخل البيانات الأساسية

### 2. ربط الحسابات (اختياري)
- اربط حساب Google أو Microsoft
- امنح الصلاحيات للتقويم والبريد

### 3. إدارة الاجتماعات
- أنشئ اجتماع جديد
- سجل الاجتماعات الحضورية
- ارفع التسجيلات للتحليل

### 4. عرض التحليلات
- اطلع على ملخصات الاجتماعات
- استعرض القرارات والمهام
- (HR) راجع تحليلات المقابلات وبطاقات الأداء

## 🔐 الأمان

- ✅ تشفير كلمات المرور باستخدام bcrypt
- ✅ JWT للمصادقة
- ✅ CORS محمي
- ✅ التحقق من صحة المدخلات
- ⚠️ يُنصح بإضافة HTTPS في الإنتاج
- ⚠️ يُنصح بإضافة Rate Limiting

## 🌍 دعم اللغات

- ✅ العربية (كامل مع RTL)
- ✅ الإنجليزية (قيد التطوير)

## 📝 ملاحظات مهمة

### الميزات المكتملة (60-70%)
- ✅ نظام المصادقة
- ✅ إدارة الاجتماعات الأساسية
- ✅ تحليل الاجتماعات بالذكاء الاصطناعي
- ✅ التقويم الموحد
- ✅ الواجهات الأساسية

### قيد التطوير (30-40%)
- 🔄 نظام RAG الكامل (قاعدة المعرفة)
- 🔄 البوت للانضمام للاجتماعات الافتراضية
- 🔄 النسخ الفوري (Live Transcription)
- 🔄 تحليل الفيديو ولغة الجسد
- 🔄 التكامل مع ATS
- 🔄 وحدة التدريب والملاحظات

## 🤝 المساهمة

المشروع مفتوح للمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

## 📞 التواصل

للأسئلة والاستفسارات، يرجى فتح Issue في GitHub

---

**تم التطوير بواسطة**: فريق منظّم  
**الإصدار**: 1.0.0  
**آخر تحديث**: نوفمبر 2024
