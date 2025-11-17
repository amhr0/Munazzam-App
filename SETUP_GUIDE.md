# دليل الإعداد السريع - منظّم

## 🚀 البدء السريع (5 دقائق)

### الخطوة 1: تثبيت المتطلبات

تأكد من تثبيت:
- Node.js 18+ ([تحميل](https://nodejs.org))
- MongoDB 5+ ([تحميل](https://www.mongodb.com/try/download/community))

### الخطوة 2: إعداد قاعدة البيانات

```bash
# تشغيل MongoDB
mongod

# أو باستخدام Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### الخطوة 3: إعداد Backend

```bash
cd server

# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env
```

**تعديل ملف `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/munazzam
JWT_SECRET=your-super-secret-key-change-this
OPENAI_API_KEY=sk-your-openai-key-here
```

```bash
# تشغيل الخادم
npm run dev
```

### الخطوة 4: إعداد Frontend

```bash
cd ../client

# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env
```

**تعديل ملف `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# تشغيل التطبيق
npm run dev
```

### الخطوة 5: الوصول للتطبيق

افتح المتصفح على: **http://localhost:5173**

---

## 🔑 الحصول على API Keys

### OpenAI API Key (مطلوب)

1. اذهب إلى: https://platform.openai.com/api-keys
2. سجل دخول أو أنشئ حساب
3. اضغط "Create new secret key"
4. انسخ المفتاح وأضفه في `.env`:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```

**ملاحظة**: OpenAI API مدفوع، لكن يمكنك الحصول على رصيد تجريبي مجاني.

### بدائل OpenAI (اختياري)

يمكنك استخدام نماذج أخرى:

#### DeepSeek (موصى به للعربية)
```env
OPENAI_API_KEY=your-deepseek-key
AI_MODEL=deepseek-chat
```

#### Claude (Anthropic)
يتطلب تعديل الكود لاستخدام Anthropic SDK

#### Gemini (Google)
يتطلب تعديل الكود لاستخدام Google AI SDK

---

## 🔗 إعداد Google OAuth (اختياري)

### لماذا تحتاجه؟
- تسجيل الدخول عبر Google
- مزامنة Google Calendar
- قراءة Gmail

### الخطوات:

1. **إنشاء مشروع Google Cloud**
   - اذهب إلى: https://console.cloud.google.com
   - اضغط "New Project"
   - أدخل اسم المشروع: "Munazzam"

2. **تفعيل APIs**
   - في القائمة الجانبية: APIs & Services > Library
   - ابحث وفعّل:
     - Google Calendar API
     - Gmail API
     - Google+ API

3. **إنشاء OAuth Credentials**
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - احفظ Client ID و Client Secret

4. **إضافة المفاتيح في `.env`**
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

---

## 🔗 إعداد Microsoft OAuth (اختياري)

### لماذا تحتاجه؟
- تسجيل الدخول عبر Microsoft
- مزامنة Outlook Calendar
- قراءة Outlook Email

### الخطوات:

1. **إنشاء تطبيق Azure AD**
   - اذهب إلى: https://portal.azure.com
   - Azure Active Directory > App registrations
   - New registration
   - Name: "Munazzam"
   - Redirect URI: `http://localhost:5000/api/auth/microsoft/callback`

2. **إنشاء Client Secret**
   - في التطبيق: Certificates & secrets
   - New client secret
   - احفظ القيمة (تظهر مرة واحدة فقط!)

3. **إضافة Permissions**
   - API permissions > Add a permission
   - Microsoft Graph > Delegated permissions
   - أضف:
     - Calendars.ReadWrite
     - Mail.Read
     - User.Read

4. **إضافة المفاتيح في `.env`**
   ```env
   MICROSOFT_CLIENT_ID=your-application-id
   MICROSOFT_CLIENT_SECRET=your-client-secret
   MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/microsoft/callback
   ```

---

## 🧪 اختبار التطبيق

### 1. إنشاء حساب
- افتح http://localhost:5173
- اضغط "إنشاء حساب"
- اختر نوع الحساب (أعمال أو HR)
- أدخل البيانات

### 2. اختبار الاجتماعات
- اذهب إلى "الاجتماعات"
- اضغط "اجتماع جديد"
- أدخل التفاصيل
- ارفع ملف صوتي للتحليل

### 3. اختبار التقويم
- اذهب إلى "التقويم"
- اضغط "مزامنة Google" (إذا كنت أعددت OAuth)

---

## ❗ حل المشاكل الشائعة

### المشكلة: "Cannot connect to MongoDB"
**الحل:**
```bash
# تأكد من تشغيل MongoDB
mongod

# أو تحقق من MONGODB_URI في .env
```

### المشكلة: "OpenAI API Error"
**الحل:**
- تحقق من صحة OPENAI_API_KEY
- تأكد من وجود رصيد في حسابك
- تحقق من الاتصال بالإنترنت

### المشكلة: "CORS Error"
**الحل:**
- تأكد من تشغيل Backend على port 5000
- تحقق من VITE_API_URL في client/.env

### المشكلة: "Google OAuth not working"
**الحل:**
- تأكد من Redirect URI صحيح
- تحقق من تفعيل APIs في Google Cloud
- تأكد من Client ID و Secret صحيحين

---

## 📊 هيكل ملفات .env

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/munazzam

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI
OPENAI_API_KEY=sk-your-openai-key
AI_MODEL=gpt-4

# Google (اختياري)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Microsoft (اختياري)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/microsoft/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=منظّم
VITE_APP_VERSION=1.0.0
```

---

## 🎯 الخطوات التالية

بعد إعداد التطبيق بنجاح:

1. ✅ جرب إنشاء اجتماع
2. ✅ ارفع تسجيل صوتي للتحليل
3. ✅ اربط حساب Google/Microsoft (اختياري)
4. ✅ استكشف التقويم والبريد الوارد
5. ✅ (HR) جرب تحليل مقابلة

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع قسم "حل المشاكل الشائعة" أعلاه
2. تحقق من logs في Terminal
3. افتح Issue في GitHub

---

**نصيحة**: احفظ نسخة من ملفات `.env` في مكان آمن!
