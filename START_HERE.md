# 🚀 ابدأ هنا - دليل التشغيل السريع

## ⚡ تشغيل المشروع في 5 دقائق

### الخطوة 1: تثبيت MongoDB
```bash
# إذا لم يكن مثبتاً
sudo apt-get install mongodb
# أو استخدم MongoDB Atlas (موصى به)
```

### الخطوة 2: Backend
```bash
cd server
npm install
cp .env.example .env
nano .env
```

**أضف في .env:**
```env
DEEPSEEK_API_KEY=sk-your-key-here
MONGODB_URI=mongodb://localhost:27017/munazzam
JWT_SECRET=any-random-secret-key-123
```

**احفظ واخرج:** `Ctrl+X` ثم `Y` ثم `Enter`

```bash
npm run dev
```

### الخطوة 3: Frontend (في terminal جديد)
```bash
cd client
npm install
npm run dev
```

### الخطوة 4: افتح المتصفح
```
http://localhost:5173
```

---

## ✅ تم! المشروع يعمل الآن

---

## 🔑 المفاتيح المطلوبة

### إلزامي:
1. **DEEPSEEK_API_KEY** - احصل عليه من https://platform.deepseek.com
2. **MONGODB_URI** - استخدم MongoDB Atlas أو محلي
3. **JWT_SECRET** - أي نص عشوائي

### اختياري (للميزات المتقدمة):
4. Google OAuth - للتقويم والبريد
5. Microsoft OAuth - لـ Outlook

---

## 📱 الصفحات المتاحة

- `/` - الصفحة الرئيسية
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب
- `/dashboard` - لوحة التحكم
- `/meetings` - إدارة الاجتماعات
- `/calendar` - التقويم

---

## 🐛 حل المشاكل

### Backend لا يعمل؟
```bash
# تأكد من MongoDB
sudo systemctl status mongodb

# تأكد من .env
cat server/.env
```

### Frontend لا يعمل؟
```bash
# تأكد من Backend يعمل أولاً
# ثم أعد تشغيل Frontend
cd client && npm run dev
```

### خطأ في الاتصال؟
```bash
# تأكد من VITE_API_URL في client/.env
echo "VITE_API_URL=http://localhost:5000/api" > client/.env
```

---

## 📚 المزيد من التوثيق

- `README.md` - دليل شامل
- `SETUP_GUIDE.md` - دليل الإعداد التفصيلي
- `DEVELOPER_GUIDE.md` - دليل المطورين
- `DEEPSEEK_FIX_REPORT.md` - تقرير التحديثات

---

## 🎯 الميزات الجاهزة

✅ نظام مصادقة كامل  
✅ إدارة الاجتماعات  
✅ تحليل ذكاء اصطناعي (DeepSeek)  
✅ تحليل المقابلات HR  
✅ بطاقة الأداء التلقائية  
✅ تقويم تفاعلي  
✅ واجهة عربية كاملة  

---

## 💡 نصائح

1. استخدم MongoDB Atlas للسهولة (مجاني)
2. احصل على DEEPSEEK_API_KEY أولاً
3. اختبر Backend قبل Frontend
4. راجع console للأخطاء

---

**بالتوفيق! 🚀**
