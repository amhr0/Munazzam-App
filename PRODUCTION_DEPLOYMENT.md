# 🚀 دليل النشر على الخادم المباشر

## ✅ النشر المكتمل

تم نشر نظام **منظم** بنجاح على خادم Hostinger VPS!

### 🌐 معلومات الخادم

- **IP Address**: 72.61.201.103
- **رابط الموقع**: http://72.61.201.103
- **نظام التشغيل**: Ubuntu 24.04.3 LTS
- **مدير العمليات**: PM2
- **خادم الويب**: Nginx
- **قاعدة البيانات**: PostgreSQL (Neon)

---

## 📦 البنية التحتية المثبتة

### البرامج المثبتة
- ✅ Node.js v22.21.0
- ✅ pnpm
- ✅ PM2 (مدير العمليات)
- ✅ Nginx (خادم الويب)
- ✅ Python 3.12 + pip
- ✅ مكتبات Computer Vision (DeepFace, MediaPipe, OpenCV)

### المسارات الرئيسية
```
/var/www/munazzam/          # مجلد المشروع
/var/www/munazzam/dist/     # الملفات المبنية
/etc/nginx/sites-available/munazzam.conf  # إعدادات Nginx
~/.ssh/id_manual_test       # مفتاح SSH
```

---

## 🔄 تحديث الموقع

### الطريقة الأولى: سكريبت النشر التلقائي

```bash
cd /home/ubuntu/munazzam
./deploy.sh
```

هذا السكريبت يقوم بـ:
1. بناء المشروع محلياً
2. ضغط الملفات
3. رفعها إلى الخادم
4. فك الضغط واستبدال الملفات
5. إعادة تشغيل PM2

### الطريقة الثانية: يدوياً

```bash
# 1. بناء المشروع محلياً
cd /home/ubuntu/munazzam
pnpm build

# 2. ضغط ورفع
tar czf dist.tar.gz dist/
scp -i ~/.ssh/id_manual_test dist.tar.gz root@72.61.201.103:/tmp/

# 3. على الخادم
ssh -i ~/.ssh/id_manual_test root@72.61.201.103
cd /var/www/munazzam
rm -rf dist
tar xzf /tmp/dist.tar.gz
rm /tmp/dist.tar.gz
pm2 restart munazzam
```

---

## 🔧 إدارة الخادم

### الاتصال بالخادم
```bash
ssh -i ~/.ssh/id_manual_test root@72.61.201.103
```

### إدارة PM2
```bash
# عرض حالة التطبيق
pm2 list

# عرض السجلات المباشرة
pm2 logs munazzam

# عرض آخر 100 سطر من السجلات
pm2 logs munazzam --lines 100

# إعادة تشغيل التطبيق
pm2 restart munazzam

# إيقاف التطبيق
pm2 stop munazzam

# بدء التطبيق
pm2 start munazzam

# عرض معلومات مفصلة
pm2 show munazzam
```

### إدارة Nginx
```bash
# اختبار الإعدادات
nginx -t

# إعادة تحميل الإعدادات
systemctl reload nginx

# إعادة تشغيل Nginx
systemctl restart nginx

# عرض الحالة
systemctl status nginx

# عرض سجلات الأخطاء
tail -f /var/log/nginx/error.log

# عرض سجلات الوصول
tail -f /var/log/nginx/access.log
```

---

## 🗄️ قاعدة البيانات

### معلومات الاتصال
- **النوع**: PostgreSQL (Neon Serverless)
- **Connection String**: مخزن في متغيرات البيئة على الخادم

### إدارة قاعدة البيانات
```bash
# الاتصال بقاعدة البيانات من المحلي
psql 'postgresql://neondb_owner:npg_3G1elitnhYFN@ep-shiny-term-a45swonx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

# تشغيل migrations
cd /var/www/munazzam
pnpm db:push
```

---

## 🔐 المتغيرات البيئية

المتغيرات المطلوبة على الخادم:

```bash
DATABASE_URL=postgresql://...
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...  # لـ RAG system
JWT_SECRET=...
PORT=3000
NODE_ENV=production
```

### تحديث المتغيرات
```bash
# إيقاف التطبيق
pm2 stop munazzam

# تحديث المتغير
pm2 delete munazzam
DATABASE_URL='...' DEEPSEEK_API_KEY='...' pm2 start dist/index.js --name munazzam -i 1

# حفظ الإعدادات
pm2 save
```

---

## 📊 المراقبة

### فحص صحة النظام
```bash
# حالة PM2
pm2 list

# استخدام الموارد
pm2 monit

# حالة Nginx
systemctl status nginx

# مساحة القرص
df -h

# استخدام الذاكرة
free -h

# العمليات النشطة
top
```

### السجلات
```bash
# سجلات التطبيق
pm2 logs munazzam --lines 200

# سجلات Nginx
tail -100 /var/log/nginx/error.log
tail -100 /var/log/nginx/access.log

# سجلات النظام
journalctl -u nginx -n 100
```

---

## 🔒 الأمان

### إعدادات Firewall (إذا لزم الأمر)
```bash
# السماح بـ HTTP
ufw allow 80/tcp

# السماح بـ HTTPS
ufw allow 443/tcp

# السماح بـ SSH
ufw allow 22/tcp

# تفعيل Firewall
ufw enable
```

### SSL/HTTPS (خطوة مستقبلية)
```bash
# تثبيت Certbot
apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
certbot --nginx -d yourdomain.com

# تجديد تلقائي
certbot renew --dry-run
```

---

## 🐛 استكشاف الأخطاء

### الموقع لا يعمل
```bash
# 1. فحص حالة PM2
pm2 list
pm2 logs munazzam --lines 50

# 2. فحص Nginx
systemctl status nginx
nginx -t

# 3. فحص الاتصال بالمنفذ
curl http://localhost:3000

# 4. إعادة تشغيل الخدمات
pm2 restart munazzam
systemctl restart nginx
```

### مشاكل قاعدة البيانات
```bash
# فحص الاتصال
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message));"
```

### مشاكل الذاكرة
```bash
# زيادة حد الذاكرة لـ Node.js
pm2 delete munazzam
NODE_OPTIONS="--max-old-space-size=2048" pm2 start dist/index.js --name munazzam
pm2 save
```

---

## 📝 ملاحظات مهمة

1. **RAG System**: يحتاج إلى رفع ملفات PDF إلى `/var/www/munazzam/knowledge_base/`
2. **OAuth Credentials**: يجب إضافة Google/Microsoft OAuth credentials في متغيرات البيئة
3. **Chrome Extension**: يجب نشره على Chrome Web Store بشكل منفصل
4. **Backups**: يُنصح بإعداد نظام نسخ احتياطي دوري لقاعدة البيانات
5. **Domain**: عند ربط دومين، يجب تحديث `server_name` في إعدادات Nginx

---

## 🎯 الخطوات التالية

- [ ] ربط دومين مخصص
- [ ] إعداد SSL/HTTPS
- [ ] رفع ملفات RAG (14 كتاب PDF)
- [ ] إضافة OAuth credentials للإنتاج
- [ ] نشر Chrome Extension على Chrome Web Store
- [ ] إعداد نظام النسخ الاحتياطي
- [ ] إعداد نظام المراقبة (Monitoring)
- [ ] إعداد CI/CD للنشر التلقائي

---

## 📞 الدعم

للمساعدة أو الاستفسارات:
- راجع الوثائق في `/home/ubuntu/munazzam/`
- تحقق من السجلات: `pm2 logs munazzam`
- اختبر الموقع: http://72.61.201.103

---

**تم النشر بنجاح! 🎉**
