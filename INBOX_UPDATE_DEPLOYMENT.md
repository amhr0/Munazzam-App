# تحديث صفحة البريد الوارد - تعليمات النشر

## التغييرات المطبقة

### 1. إنشاء صفحة Inbox جديدة
- **الملف:** `client/src/pages/Inbox.jsx`
- **الوصف:** صفحة كاملة للبريد الوارد مع واجهة لربط Google و Microsoft

### 2. إضافة Route للـ Inbox
- **الملف:** `client/src/App.jsx`
- **التغيير:** إضافة `/app/inbox` route

## المميزات المضافة

### صفحة البريد الوارد تحتوي على:
1. **واجهة ربط البريد الإلكتروني**
   - زر لربط Gmail (Google)
   - زر لربط Outlook (Microsoft)
   - رسالة توضيحية عن الخصوصية

2. **واجهة عرض الرسائل**
   - قائمة الرسائل (عند الربط)
   - زر تحديث
   - حالة فارغة عند عدم وجود رسائل

3. **التصميم**
   - متوافق مع باقي التطبيق
   - يدعم RTL بالكامل
   - responsive design

## خطوات النشر على السيرفر

### الطريقة 1: عبر Git (الموصى بها)

```bash
# 1. Commit التغييرات
cd /home/ubuntu/Munazzam-App
git add .
git commit -m "feat: add Inbox page with email integration UI"
git push origin main

# 2. SSH إلى السيرفر
ssh root@72.61.201.103

# 3. Pull التحديثات
cd /path/to/Munazzam-App
git pull origin main

# 4. إعادة بناء Frontend
cd client
npm install
npm run build

# 5. إعادة تشغيل Docker
cd ..
docker compose down
docker compose up --build -d

# 6. التحقق
docker compose logs -f backend
```

### الطريقة 2: رفع الملفات مباشرة

```bash
# 1. نسخ الملفات للسيرفر
scp client/src/pages/Inbox.jsx root@72.61.201.103:/path/to/Munazzam-App/client/src/pages/
scp client/src/App.jsx root@72.61.201.103:/path/to/Munazzam-App/client/src/

# 2. SSH إلى السيرفر
ssh root@72.61.201.103

# 3. إعادة بناء Frontend
cd /path/to/Munazzam-App/client
npm run build

# 4. إعادة تشغيل Docker
cd ..
docker compose restart frontend
```

## الخطوات التالية (Backend Integration)

لتفعيل الربط الفعلي مع Gmail و Outlook، يجب:

### 1. إضافة Google OAuth
```javascript
// server/routes/auth.js
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
}));

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/app/inbox');
    }
);
```

### 2. إضافة Microsoft OAuth
```javascript
// server/routes/auth.js
router.get('/auth/microsoft', passport.authenticate('microsoft', {
    scope: ['user.read', 'mail.read']
}));

router.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/app/inbox');
    }
);
```

### 3. تثبيت الحزم المطلوبة
```bash
cd server
npm install passport-google-oauth20 passport-microsoft
npm install googleapis @microsoft/microsoft-graph-client
```

### 4. إضافة API endpoints
```javascript
// server/routes/emails.js
router.get('/api/emails', authMiddleware, async (req, res) => {
    // Fetch emails from Google or Microsoft
});
```

## الاختبار

بعد النشر، اختبر:
1. ✅ الوصول لـ http://72.61.201.103:3000/app/inbox
2. ✅ عرض واجهة الربط
3. ✅ النقر على زر "البريد الوارد" من Dashboard

## ملاحظات

- الصفحة الآن جاهزة من ناحية Frontend
- يحتاج Backend integration للربط الفعلي
- OAuth credentials يجب إضافتها في `.env`
- يجب تفعيل Google Cloud Console APIs
- يجب تسجيل التطبيق في Azure (Microsoft)

## الحالة

- ✅ Frontend: جاهز
- ⏳ Backend: يحتاج تطوير
- ⏳ OAuth: يحتاج إعداد
- ⏳ API Integration: يحتاج تطوير
