# 🚀 تعليمات النشر - مشروع منظّم

دليل شامل لنشر التحديثات الأمنية على السيرفر.

---

## 📋 معلومات السيرفر

- **IP Address**: 72.61.201.103
- **Location**: United Kingdom - Manchester
- **OS**: Ubuntu 24.04 with CloudPanel
- **SSH Access**: `ssh root@72.61.201.103`
- **Panel**: CloudPanel (https://72.61.201.103:8443/admin)

---

## ⚠️ قبل البدء

### 1. عمل Backup
```bash
# SSH إلى السيرفر
ssh root@72.61.201.103

# عمل backup لقاعدة البيانات
docker exec munazzam-mongodb mongodump --out=/data/backup/$(date +%Y%m%d_%H%M%S)

# عمل backup للملفات المرفوعة
tar -czf /root/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/Munazzam-App/server/uploads/

# عمل backup للكود الحالي
cd /path/to/Munazzam-App
git stash
git branch backup-$(date +%Y%m%d_%H%M%S)
```

### 2. التحقق من المتطلبات
```bash
# التحقق من Docker
docker --version
docker compose version

# التحقق من Git
git --version

# التحقق من Node.js
node --version
npm --version
```

---

## 🔄 خطوات النشر

### الخطوة 1: تحديث الكود

```bash
# SSH إلى السيرفر
ssh root@72.61.201.103

# الانتقال لمجلد المشروع
cd /path/to/Munazzam-App

# Pull آخر التحديثات
git pull origin main

# إذا كان هناك تعارضات، حلها أو استخدم:
# git fetch origin
# git reset --hard origin/main
```

### الخطوة 2: تحديث التبعيات

```bash
# تحديث تبعيات Backend
cd server
npm install

# العودة للمجلد الرئيسي
cd ..
```

### الخطوة 3: إعداد ملف .env

```bash
# التحقق من وجود .env
ls -la server/.env

# إذا لم يكن موجوداً، أنشئه من .env.example
cd server
cp .env.example .env

# تعديل .env وإضافة القيم الحقيقية
nano .env
```

**⚠️ مهم جداً: تأكد من إضافة القيم التالية في `.env`:**

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://mongodb:27017/munazzam

# JWT Secret (استخدم قيمة قوية وعشوائية)
JWT_SECRET=your-actual-strong-jwt-secret-here

# AI Services
DEEPSEEK_API_KEY=your-actual-deepseek-api-key
OPENAI_API_KEY=your-actual-openai-api-key

# Frontend URL
FRONTEND_URL=http://72.61.201.103

# Security
ALLOWED_ORIGINS=http://72.61.201.103,http://localhost:5173

# Session Secret
SESSION_SECRET=your-actual-session-secret
```

**لتوليد JWT_SECRET قوي:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### الخطوة 4: إعادة بناء وتشغيل Docker

```bash
# العودة للمجلد الرئيسي
cd /path/to/Munazzam-App

# إيقاف الحاويات الحالية
docker compose down

# إعادة بناء الصور
docker compose build --no-cache

# تشغيل الحاويات
docker compose up -d

# التحقق من الحالة
docker compose ps
```

**يجب أن ترى:**
```
NAME                   STATUS
munazzam-mongodb       Up
munazzam-backend       Up
munazzam-frontend      Up
```

### الخطوة 5: التحقق من Logs

```bash
# مشاهدة logs للـ backend
docker compose logs -f backend

# يجب أن ترى:
# ✅ Connected to MongoDB
# 🚀 Server running on port 5000
# 📝 Environment: production
```

**إذا رأيت أخطاء:**
```bash
# التحقق من logs كل حاوية
docker compose logs mongodb
docker compose logs backend
docker compose logs frontend

# التحقق من حالة الحاويات
docker compose ps -a
```

---

## 🧪 اختبار التحديثات

### 1. اختبار الصحة العامة

```bash
# من جهازك المحلي أو من السيرفر
curl http://72.61.201.103:5000/health

# يجب أن ترى:
# {
#   "status": "ok",
#   "database": "connected",
#   "environment": "production"
# }
```

### 2. اختبار Authentication

```bash
# تسجيل مستخدم جديد
curl -X POST http://72.61.201.103:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234",
    "userType": "business"
  }' \
  -c cookies.txt \
  -v

# يجب أن ترى Set-Cookie header مع token
# ويجب أن يكون httpOnly=true

# تسجيل الدخول
curl -X POST http://72.61.201.103:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }' \
  -c cookies.txt \
  -v

# الحصول على معلومات المستخدم
curl -X GET http://72.61.201.103:5000/api/auth/me \
  -b cookies.txt

# يجب أن ترى معلومات المستخدم
```

### 3. اختبار File Upload Security

```bash
# إنشاء ملف اختبار
echo "test audio content" > test.mp3

# محاولة رفع ملف (يحتاج authentication)
curl -X POST http://72.61.201.103:5000/api/meetings/test-id/recording \
  -b cookies.txt \
  -F "audio=@test.mp3" \
  -v

# محاولة الوصول للملفات بدون authentication (يجب أن تفشل)
curl http://72.61.201.103:5000/uploads/recordings/test.mp3 \
  -v

# يجب أن ترى 401 Unauthorized
```

### 4. اختبار NoSQL Injection Prevention

```bash
# محاولة injection (يجب أن تفشل)
curl -X GET "http://72.61.201.103:5000/api/admin/users?search=\$ne" \
  -b cookies.txt \
  -v

# يجب أن يتم sanitize المدخلات
```

### 5. اختبار Frontend

```bash
# فتح المتصفح والذهاب إلى
http://72.61.201.103

# يجب أن ترى:
# - صفحة الهبوط
# - يمكنك التسجيل وتسجيل الدخول
# - التوكن يُحفظ في cookies (افحص DevTools -> Application -> Cookies)
```

---

## 🔍 مراقبة النظام

### مراقبة الموارد

```bash
# استخدام CPU والذاكرة
docker stats

# مساحة القرص
df -h

# حالة الحاويات
docker compose ps
```

### مراقبة Logs

```bash
# Backend logs
docker compose logs -f backend --tail=100

# MongoDB logs
docker compose logs -f mongodb --tail=100

# جميع الحاويات
docker compose logs -f --tail=100
```

### مراقبة قاعدة البيانات

```bash
# الدخول إلى MongoDB shell
docker exec -it munazzam-mongodb mongosh munazzam

# عرض المستخدمين
db.users.find().pretty()

# عرض الاجتماعات
db.meetings.find().pretty()

# الخروج
exit
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: الحاوية لا تعمل

```bash
# التحقق من الحالة
docker compose ps -a

# إذا كانت الحاوية في حالة Exited
docker compose logs backend

# إعادة التشغيل
docker compose restart backend

# إذا لم تعمل، أعد البناء
docker compose down
docker compose up --build -d
```

### المشكلة 2: لا يمكن الاتصال بقاعدة البيانات

```bash
# التحقق من MongoDB
docker compose logs mongodb

# التحقق من network
docker network ls
docker network inspect munazzam-network

# إعادة تشغيل MongoDB
docker compose restart mongodb

# الانتظار قليلاً ثم إعادة تشغيل Backend
sleep 5
docker compose restart backend
```

### المشكلة 3: خطأ في JWT_SECRET

```bash
# التحقق من .env
cat server/.env | grep JWT_SECRET

# إذا كان فارغاً أو غير موجود
cd server
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")" >> .env

# إعادة تشغيل Backend
cd ..
docker compose restart backend
```

### المشكلة 4: CORS errors

```bash
# التحقق من FRONTEND_URL في .env
cat server/.env | grep FRONTEND_URL

# يجب أن يكون:
# FRONTEND_URL=http://72.61.201.103

# إذا كان خاطئاً، عدله
nano server/.env

# ثم أعد تشغيل Backend
docker compose restart backend
```

### المشكلة 5: File upload لا يعمل

```bash
# التحقق من مجلد uploads
ls -la server/uploads/

# التحقق من الصلاحيات
chmod -R 755 server/uploads/

# التحقق من أن المجلد موجود في الحاوية
docker exec munazzam-backend ls -la /app/uploads/

# إذا لم يكن موجوداً
docker exec munazzam-backend mkdir -p /app/uploads/recordings/
```

---

## 🔄 Rollback (العودة للنسخة السابقة)

إذا حدثت مشاكل، يمكنك العودة للنسخة السابقة:

```bash
# إيقاف الحاويات
docker compose down

# العودة للـ commit السابق
git log --oneline -10
git checkout <previous-commit-hash>

# أو العودة للـ branch الاحتياطي
git checkout backup-YYYYMMDD_HHMMSS

# إعادة التشغيل
docker compose up --build -d

# استعادة backup قاعدة البيانات إذا لزم الأمر
docker exec munazzam-mongodb mongorestore /data/backup/YYYYMMDD_HHMMSS
```

---

## 📊 Checklist بعد النشر

### ✅ التحقق الفوري
- [ ] الحاويات تعمل (`docker compose ps`)
- [ ] Backend يستجيب (`curl http://72.61.201.103:5000/health`)
- [ ] Frontend يظهر (`http://72.61.201.103`)
- [ ] لا توجد أخطاء في logs (`docker compose logs`)

### ✅ اختبار الوظائف
- [ ] التسجيل يعمل
- [ ] تسجيل الدخول يعمل
- [ ] التوكن يُحفظ في cookies (httpOnly)
- [ ] الـ protected routes تتطلب authentication
- [ ] File upload يعمل ويتحقق من نوع الملف
- [ ] الملفات المرفوعة محمية بـ authentication

### ✅ الأمان
- [ ] JWT_SECRET قوي وعشوائي
- [ ] API keys غير مكشوفة
- [ ] HTTPS مفعل (إذا متاح)
- [ ] Firewall rules مضبوطة
- [ ] Rate limiting يعمل

### ✅ المراقبة
- [ ] إعداد monitoring للـ uptime
- [ ] إعداد alerts للأخطاء
- [ ] مراقبة استخدام الموارد
- [ ] إعداد automated backups

---

## 🔐 إعدادات الأمان الإضافية

### 1. إعداد Firewall

```bash
# فتح المنافذ المطلوبة فقط
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw allow 5000/tcp

# تفعيل Firewall
ufw enable

# التحقق من الحالة
ufw status
```

### 2. إعداد HTTPS (Let's Encrypt)

```bash
# تثبيت Certbot
apt update
apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
certbot --nginx -d yourdomain.com

# التجديد التلقائي
certbot renew --dry-run
```

### 3. إعداد Automated Backups

```bash
# إنشاء script للـ backup
cat > /root/backup-munazzam.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/munazzam"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec munazzam-mongodb mongodump --out=/data/backup/$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/Munazzam-App/server/uploads/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# جعل الـ script قابل للتنفيذ
chmod +x /root/backup-munazzam.sh

# إضافة cron job (كل يوم الساعة 2 صباحاً)
crontab -e
# أضف السطر التالي:
# 0 2 * * * /root/backup-munazzam.sh >> /var/log/munazzam-backup.log 2>&1
```

---

## 📞 الدعم والمساعدة

### الملفات المرجعية
- `SECURITY_FIXES.md` - تفاصيل الإصلاحات الأمنية
- `CURSOR_PROMPTS.md` - Prompts للتطوير باستخدام Cursor
- `.cursorrules` - قواعد المشروع
- `TODO.md` - المهام المتبقية
- `SECURITY_AUDIT_REPORT.md` - تقرير التدقيق الأمني الكامل

### أوامر مفيدة

```bash
# إعادة تشغيل كل شيء
docker compose restart

# إعادة بناء كل شيء
docker compose down && docker compose up --build -d

# مسح كل شيء وبدء من جديد (⚠️ خطر!)
docker compose down -v
docker compose up --build -d

# عرض استخدام الموارد
docker stats

# تنظيف Docker
docker system prune -a
```

---

## ✅ النشر الناجح

إذا نجحت جميع الاختبارات:

1. ✅ الحاويات تعمل بشكل صحيح
2. ✅ Authentication يعمل مع cookies
3. ✅ File upload محمي ويتحقق من الملفات
4. ✅ NoSQL injection محظور
5. ✅ API keys آمنة
6. ✅ Logs نظيفة بدون أخطاء

**🎉 تهانينا! التحديثات الأمنية تم نشرها بنجاح!**

---

**آخر تحديث:** 2025-01-20  
**الحالة:** ✅ Ready for Production  
**الإصدار:** 1.0.1-security-fixes
