# ⚡ دليل البدء السريع - نظام منظم

## 🌐 الوصول للنظام

**الرابط المباشر**: http://72.61.201.103

---

## 🔑 معلومات الوصول للخادم

```bash
# SSH Access
ssh -i ~/.ssh/id_manual_test root@72.61.201.103

# مسار المشروع
cd /var/www/munazzam
```

---

## ⚙️ الأوامر الأساسية

### إدارة التطبيق
```bash
pm2 list              # عرض الحالة
pm2 logs munazzam     # عرض السجلات
pm2 restart munazzam  # إعادة تشغيل
pm2 stop munazzam     # إيقاف
pm2 start munazzam    # بدء
```

### إدارة Nginx
```bash
systemctl status nginx   # عرض الحالة
systemctl restart nginx  # إعادة تشغيل
nginx -t                 # اختبار الإعدادات
```

---

## 🔧 المتغيرات المطلوبة للتفعيل الكامل

أضف هذه المتغيرات على الخادم:

```bash
DEEPSEEK_API_KEY=sk-...       # للذكاء الاصطناعي
OPENAI_API_KEY=sk-...         # للـ RAG
MONGODB_URI=mongodb+srv://... # لقاعدة بيانات RAG
GOOGLE_CLIENT_ID=...          # Google OAuth
GOOGLE_CLIENT_SECRET=...      # Google OAuth
MICROSOFT_CLIENT_ID=...       # Microsoft OAuth
MICROSOFT_CLIENT_SECRET=...   # Microsoft OAuth
JWT_SECRET=...                # للأمان
```

**كيفية الإضافة**:
```bash
ssh -i ~/.ssh/id_manual_test root@72.61.201.103
cd /var/www/munazzam
pm2 stop munazzam && pm2 delete munazzam

# أضف المتغيرات هنا
DATABASE_URL='postgresql://neondb_owner:npg_3G1elitnhYFN@ep-shiny-term-a45swonx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require' \
DEEPSEEK_API_KEY='YOUR_KEY' \
OPENAI_API_KEY='YOUR_KEY' \
MONGODB_URI='YOUR_URI' \
pm2 start dist/index.js --name munazzam -i 1

pm2 save
```

---

## 📦 ملفات RAG (14 كتاب)

رفع الكتب إلى الخادم:

```bash
scp -i ~/.ssh/id_manual_test -r knowledge_base/ root@72.61.201.103:/var/www/munazzam/
ssh -i ~/.ssh/id_manual_test root@72.61.201.103 "pm2 restart munazzam"
```

---

## 🌍 ربط دومين مخصص

### 1. توجيه DNS
أضف A Record في إعدادات الدومين:
```
Type: A
Name: @
Value: 72.61.201.103
```

### 2. تحديث Nginx
```bash
ssh -i ~/.ssh/id_manual_test root@72.61.201.103
nano /etc/nginx/sites-available/munazzam.conf

# غيّر السطر:
# server_name _;
# إلى:
# server_name munazzam.com www.munazzam.com;

nginx -t && systemctl reload nginx
```

### 3. إضافة في Manus
- افتح إعدادات المشروع في Manus
- Domains → أضف: munazzam.com
- انتظر التحقق

---

## 🔒 تفعيل SSL (HTTPS)

```bash
ssh -i ~/.ssh/id_manual_test root@72.61.201.103
apt install certbot python3-certbot-nginx
certbot --nginx -d munazzam.com -d www.munazzam.com
```

---

## 🚀 نشر تحديثات

```bash
cd /home/ubuntu/munazzam
./deploy.sh
```

---

## 📊 الاختبارات

```bash
cd /var/www/munazzam
pnpm test
```

---

## 📚 الوثائق الكاملة

- **HANDOVER_GUIDE.md** - دليل التسليم الشامل
- **PRODUCTION_DEPLOYMENT.md** - دليل النشر والإدارة
- **OAUTH_SETUP.md** - إعداد OAuth
- **README.md** - نظرة عامة

---

## ✅ قائمة التحقق السريعة

- [ ] إضافة API Keys (DEEPSEEK, OPENAI, MongoDB)
- [ ] إعداد OAuth credentials
- [ ] ربط دومين مخصص
- [ ] تفعيل SSL
- [ ] رفع ملفات RAG
- [ ] اختبار النظام

---

**الحالة**: ✅ جاهز للإنتاج  
**الرابط**: http://72.61.201.103
