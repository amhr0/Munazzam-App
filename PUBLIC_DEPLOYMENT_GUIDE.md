# 🌍 دليل النشر العام لمشروع "منظّم"

## المرحلة الحالية: ✅ المشروع يعمل محلياً

الآن مشروعك يعمل على السيرفر (72.61.201.103)، لكنه متاح فقط عبر IP. لجعله متاحاً للجميع بشكل احترافي، يجب إكمال الخطوات التالية:

---

## 📋 الخطوات المطلوبة للنشر العام

### 1️⃣ شراء دومين (اسم نطاق)

**لماذا؟** لكي يتمكن الناس من الوصول لموقعك عبر اسم سهل مثل `munazzam.com` بدلاً من `72.61.201.103`.

**أين تشتري؟**
- **Namecheap** (موصى به): https://www.namecheap.com
- **GoDaddy**: https://www.godaddy.com
- **Hostinger** (نفس الشركة التي تستضيف سيرفرك): https://www.hostinger.com/domain-name-search

**السعر:** حوالي $10-15 سنوياً.

**الخطوات:**
1. اذهب إلى أحد المواقع أعلاه.
2. ابحث عن اسم نطاق مناسب (مثل `munazzam.com` أو `munazzam.app`).
3. اشتري الدومين.
4. احتفظ ببيانات الدخول.

---

### 2️⃣ ربط الدومين بالسيرفر (DNS Configuration)

**لماذا؟** لكي يعرف الإنترنت أن `munazzam.com` يشير إلى سيرفرك (72.61.201.103).

**الخطوات:**

#### أ. إذا اشتريت الدومين من Hostinger (نفس شركة السيرفر):
1. اذهب إلى [Hostinger DNS Management](https://hpanel.hostinger.com/domains).
2. اختر الدومين الذي اشتريته.
3. اذهب إلى **DNS / Name Servers**.
4. أضف السجلات التالية:

| Type  | Name | Value           | TTL  |
|-------|------|-----------------|------|
| A     | @    | 72.61.201.103   | 3600 |
| A     | www  | 72.61.201.103   | 3600 |

#### ب. إذا اشتريت الدومين من مكان آخر (Namecheap, GoDaddy):
1. اذهب إلى لوحة تحكم الدومين.
2. ابحث عن **DNS Settings** أو **Advanced DNS**.
3. أضف نفس السجلات أعلاه.

**ملاحظة:** قد يستغرق الأمر من 5 دقائق إلى 24 ساعة حتى ينتشر التغيير عالمياً.

---

### 3️⃣ تثبيت SSL Certificate (HTTPS)

**لماذا؟** لحماية بيانات المستخدمين وجعل الموقع آمناً (🔒 HTTPS بدلاً من HTTP).

**الطريقة:** استخدام **Certbot** (مجاني من Let's Encrypt).

**الخطوات:**

#### أ. تسجيل الدخول للسيرفر:
```bash
ssh root@72.61.201.103
# كلمة المرور: Abdulmjeed0@
```

#### ب. تثبيت Certbot:
```bash
apt update
apt install -y certbot python3-certbot-nginx
```

#### ج. الحصول على SSL Certificate:
```bash
certbot --nginx -d munazzam.com -d www.munazzam.com
```

**ملاحظة:** استبدل `munazzam.com` باسم الدومين الذي اشتريته.

**سيسألك Certbot:**
- **Email:** أدخل بريدك الإلكتروني (amhr551@gmail.com).
- **Terms of Service:** اكتب `Y` (موافق).
- **Redirect HTTP to HTTPS:** اكتب `2` (نعم، إعادة توجيه تلقائية).

#### د. تجديد تلقائي (Certbot يجدد تلقائياً كل 90 يوم):
```bash
certbot renew --dry-run
```

---

### 4️⃣ إعداد Nginx Reverse Proxy

**لماذا؟** لكي يعمل الموقع على Port 80 (HTTP) و 443 (HTTPS) بدلاً من 3000 و 5000.

**الخطوات:**

#### أ. إنشاء ملف Nginx Configuration:
```bash
nano /etc/nginx/sites-available/munazzam
```

#### ب. أضف هذا المحتوى (استبدل `munazzam.com` بدومينك):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name munazzam.com www.munazzam.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name munazzam.com www.munazzam.com;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/munazzam.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/munazzam.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Max upload size
    client_max_body_size 100M;
}
```

#### ج. تفعيل الإعدادات:
```bash
ln -s /etc/nginx/sites-available/munazzam /etc/nginx/sites-enabled/
nginx -t  # اختبار الإعدادات
systemctl reload nginx
```

---

### 5️⃣ تحديث إعدادات التطبيق

**لماذا؟** لكي يعمل التطبيق مع الدومين الجديد بدلاً من IP.

#### أ. تحديث `.env` في السيرفر:
```bash
cd /root/Munazzam-App/server
nano .env
```

**غيّر:**
```
FRONTEND_URL=http://72.61.201.103:3000
```

**إلى:**
```
FRONTEND_URL=https://munazzam.com
```

#### ب. تحديث `docker-compose.yml`:
```bash
cd /root/Munazzam-App
nano docker-compose.yml
```

**غيّر:**
```yaml
- VITE_API_URL=http://72.61.201.103:5000/api
```

**إلى:**
```yaml
- VITE_API_URL=https://munazzam.com/api
```

#### ج. إعادة بناء وتشغيل:
```bash
docker compose down
docker compose up -d --build
```

---

### 6️⃣ فتح Ports في Firewall

**لماذا؟** لكي يتمكن الناس من الوصول للموقع عبر HTTPS.

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

---

## ✅ التحقق من النجاح

بعد إكمال جميع الخطوات:

1. افتح المتصفح.
2. اذهب إلى `https://munazzam.com` (استبدل بدومينك).
3. يجب أن ترى 🔒 في شريط العنوان.
4. جرب تسجيل الدخول والتأكد من عمل جميع المميزات.

---

## 🎯 ملخص سريع

| الخطوة | الحالة | ملاحظات |
|--------|--------|----------|
| 1. شراء دومين | ⏳ مطلوب | من Namecheap أو Hostinger |
| 2. ربط DNS | ⏳ مطلوب | إضافة A Records |
| 3. تثبيت SSL | ⏳ مطلوب | استخدام Certbot |
| 4. إعداد Nginx | ⏳ مطلوب | Reverse Proxy |
| 5. تحديث إعدادات | ⏳ مطلوب | .env و docker-compose.yml |
| 6. فتح Ports | ⏳ مطلوب | UFW Firewall |

---

## 🆘 إذا واجهت مشاكل

### المشكلة: الموقع لا يفتح بعد ربط الدومين
**الحل:**
1. تأكد من انتشار DNS (اختبر على https://dnschecker.org).
2. تأكد من تشغيل Nginx: `systemctl status nginx`.
3. تحقق من logs: `docker compose logs backend`.

### المشكلة: SSL Certificate لا يعمل
**الحل:**
1. تأكد من أن الدومين يشير للسيرفر قبل تشغيل Certbot.
2. أعد محاولة Certbot: `certbot --nginx -d munazzam.com`.

### المشكلة: تسجيل الدخول لا يعمل بعد التحديث
**الحل:**
1. تأكد من تحديث `FRONTEND_URL` في `.env`.
2. أعد بناء Frontend: `docker compose up -d --build frontend`.

---

## 📞 الدعم

إذا احتجت مساعدة إضافية، يمكنك:
- مراجعة هذا الدليل مرة أخرى.
- البحث عن الخطأ في Google.
- سؤالي مباشرة!

**الآن لديك كل ما تحتاجه لنشر "منظّم" للعالم! 🚀**
