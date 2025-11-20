# 🚀 تعليمات النشر السريع - تطبيق منظّم

## ✅ ما تم إنجازه

تم تطبيق جميع التحديثات الأمنية والإصلاحات على الكود المحلي ورفعها إلى GitHub بنجاح:
- ✅ إصلاح 8 ثغرات أمنية حرجة
- ✅ إضافة صفحة البريد الوارد (Inbox)
- ✅ تحسين الأمان والأداء
- ✅ رفع التحديثات إلى GitHub

## 🎯 المطلوب الآن

تطبيق التحديثات على السيرفر المباشر (72.61.201.103)

---

## 📋 الطريقة الأولى: عبر SSH (الأسرع والأسهل)

### الخطوة 1: الاتصال بالسيرفر

افتح Terminal على جهازك واكتب:

\`\`\`bash
ssh root@72.61.201.103
\`\`\`

سيطلب منك كلمة المرور (يمكنك الحصول عليها من Hostinger Panel)

### الخطوة 2: البحث عن مجلد المشروع

\`\`\`bash
# ابحث عن مجلد المشروع
find / -name "Munazzam-App" -type d 2>/dev/null

# أو ابحث عن docker-compose.yml
find / -name "docker-compose.yml" -type f 2>/dev/null | grep -i munazzam
\`\`\`

### الخطوة 3: الانتقال لمجلد المشروع

\`\`\`bash
# استبدل المسار بالمسار الصحيح من نتيجة البحث
cd /path/to/Munazzam-App
\`\`\`

### الخطوة 4: سحب التحديثات من GitHub

\`\`\`bash
# سحب آخر التحديثات
git pull origin main

# التحقق من التحديثات
git log -1
\`\`\`

### الخطوة 5: إعادة بناء ونشر التطبيق

\`\`\`bash
# إعادة بناء Frontend
cd client
npm install
npm run build

# العودة للمجلد الرئيسي
cd ..

# إعادة تشغيل Docker
docker compose down
docker compose up --build -d

# التحقق من الحالة
docker compose ps
docker compose logs -f
\`\`\`

---

## 📋 الطريقة الثانية: عبر CloudPanel Terminal

### الخطوة 1: فتح CloudPanel

1. اذهب إلى: https://72.61.201.103:8443
2. سجل دخول بـ:
   - Username: `admin`
   - Password: (من Hostinger Panel)

### الخطوة 2: فتح Terminal

ابحث عن أيقونة Terminal أو SSH في CloudPanel

### الخطوة 3: تطبيق نفس الأوامر من الطريقة الأولى

---

## 📋 الطريقة الثالثة: رفع الملفات يدوياً (إذا فشلت الطرق السابقة)

### ملفات يجب رفعها:

1. **Frontend Files:**
   - `client/src/pages/Inbox.jsx` (جديد)
   - `client/src/App.jsx` (محدث)

2. **Backend Files:**
   - `server/middleware/authMiddleware.js` (محدث)
   - `server/middleware/fileValidation.js` (جديد)
   - `server/middleware/inputSanitization.js` (جديد)
   - `server/routes/auth.js` (محدث)
   - `server/routes/admin.js` (محدث)
   - `server/routes/meetings.js` (محدث)
   - `server/server.js` (محدث)

3. **Config Files:**
   - `server/.env.example` (محدث)
   - `.gitignore` (محدث)
   - `docker-compose.yml` (محدث)

### خطوات الرفع:

1. استخدم SFTP client (مثل FileZilla)
2. اتصل بـ: `sftp://72.61.201.103`
3. Username: `root`
4. ارفع الملفات للمسارات الصحيحة
5. نفذ الأوامر من الطريقة الأولى (الخطوة 5)

---

## 🧪 التحقق من نجاح النشر

بعد تطبيق التحديثات، تحقق من:

### 1. التحقق من عمل التطبيق

\`\`\`bash
# تحقق من حالة Docker
docker compose ps

# يجب أن ترى:
# - backend: Up
# - frontend: Up
# - mongodb: Up
\`\`\`

### 2. اختبار الموقع

افتح المتصفح واذهب إلى:
- http://72.61.201.103:3000/app/dashboard
- http://72.61.201.103:3000/app/inbox (الصفحة الجديدة)

### 3. التحقق من Logs

\`\`\`bash
# عرض logs للتأكد من عدم وجود أخطاء
docker compose logs backend
docker compose logs frontend
\`\`\`

---

## 🔧 حل المشاكل الشائعة

### المشكلة: "git pull" يفشل

**الحل:**
\`\`\`bash
# احفظ التغييرات المحلية
git stash

# اسحب التحديثات
git pull origin main

# أعد التغييرات المحلية (إذا لزم)
git stash pop
\`\`\`

### المشكلة: Docker لا يعمل

**الحل:**
\`\`\`bash
# تحقق من حالة Docker
systemctl status docker

# إذا كان متوقفاً، شغله
systemctl start docker

# أعد المحاولة
docker compose up -d
\`\`\`

### المشكلة: Port 3000 مستخدم

**الحل:**
\`\`\`bash
# ابحث عن العملية المستخدمة للـ port
lsof -i :3000

# أوقف العملية
kill -9 <PID>

# أعد تشغيل Docker
docker compose up -d
\`\`\`

### المشكلة: npm install يفشل

**الحل:**
\`\`\`bash
# امسح node_modules و package-lock
rm -rf client/node_modules client/package-lock.json

# أعد التثبيت
cd client
npm install
\`\`\`

---

## 📝 ملاحظات مهمة

### 1. ملفات البيئة (.env)

تأكد من وجود ملف `.env` في مجلد `server` يحتوي على:

\`\`\`env
# Database
MONGODB_URI=mongodb://mongodb:27017/munazzam

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
CLIENT_URL=http://72.61.201.103:3000

# Google OAuth (للبريد الوارد - سيتم إضافته لاحقاً)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Microsoft OAuth (للبريد الوارد - سيتم إضافته لاحقاً)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=
\`\`\`

### 2. النسخ الاحتياطي

قبل تطبيق التحديثات، من الأفضل عمل backup:

\`\`\`bash
# backup قاعدة البيانات
docker compose exec mongodb mongodump --out=/backup

# backup الملفات
tar -czf munazzam-backup-$(date +%Y%m%d).tar.gz /path/to/Munazzam-App
\`\`\`

---

## 🎉 بعد النشر الناجح

### الخطوات التالية لتفعيل البريد الوارد:

1. **إنشاء Google OAuth Credentials:**
   - اذهب إلى: https://console.cloud.google.com
   - أنشئ مشروع جديد
   - فعّل Gmail API
   - أنشئ OAuth 2.0 credentials
   - أضف redirect URL: `http://72.61.201.103:5000/api/auth/google/callback`

2. **إنشاء Microsoft OAuth Credentials:**
   - اذهب إلى: https://portal.azure.com
   - سجل تطبيق جديد
   - أضف permissions: `User.Read`, `Mail.Read`
   - أضف redirect URL: `http://72.61.201.103:5000/api/auth/microsoft/callback`

3. **تحديث ملف .env:**
   أضف الـ credentials في ملف `.env`

4. **إعادة تشغيل Backend:**
   \`\`\`bash
   docker compose restart backend
   \`\`\`

---

## 📞 المساعدة

إذا واجهت أي مشاكل:

1. تحقق من logs: `docker compose logs -f`
2. تحقق من حالة الخدمات: `docker compose ps`
3. راجع ملف `SECURITY_FIXES.md` لتفاصيل التغييرات
4. راجع ملف `DEPLOYMENT_INSTRUCTIONS.md` للتفاصيل الكاملة

---

## ✨ ملخص سريع

\`\`\`bash
# 1. اتصل بالسيرفر
ssh root@72.61.201.103

# 2. اذهب لمجلد المشروع
cd /path/to/Munazzam-App

# 3. اسحب التحديثات
git pull origin main

# 4. أعد البناء
cd client && npm install && npm run build && cd ..

# 5. أعد التشغيل
docker compose down && docker compose up --build -d

# 6. تحقق
docker compose ps && docker compose logs -f
\`\`\`

**هذا كل شيء! 🎉**
