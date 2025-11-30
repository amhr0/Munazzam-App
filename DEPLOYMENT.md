# دليل النشر - منظم (Munazzam)

## نظرة عامة

**منظم** هو نظام ذكاء اصطناعي متكامل للإدارة التنفيذية يوفر:
- إدارة المهام والاجتماعات والمقابلات
- مساعد ذكي مباشر (Live Copilot)
- تحليل الصوت وتحويله إلى نص
- إنشاء ملخصات يومية تلقائية
- نظام تسجيل دخول آمن بالإيميل وكلمة المرور

## المتطلبات الأساسية

### 1. البرامج المطلوبة
- **Node.js** 18+ و pnpm
- **MySQL** 8.0+ أو MariaDB 10.5+
- **Git**
- **PM2** (لإدارة العمليات في الإنتاج)

### 2. حسابات الخدمات الخارجية
- **OpenAI API** - للذكاء الاصطناعي (LLM, Whisper, DALL-E)
- **Gmail** - لإرسال رسائل البريد الإلكتروني

---

## خطوات التثبيت

### الخطوة 1: استنساخ المشروع

```bash
git clone https://github.com/amhr0/Munazzam-App.git
cd Munazzam-App
```

### الخطوة 2: تثبيت التبعيات

```bash
pnpm install
```

### الخطوة 3: إعداد قاعدة البيانات

#### إنشاء قاعدة البيانات

```sql
CREATE DATABASE munazzamdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'munazzamuser'@'localhost' IDENTIFIED BY 'MunazzamDB2024Pass!';
GRANT ALL PRIVILEGES ON munazzamdb.* TO 'munazzamuser'@'localhost';
FLUSH PRIVILEGES;
```

#### تطبيق Schema

```bash
pnpm db:push
```

### الخطوة 4: إعداد Environment Variables

أنشئ ملف `.env` في المجلد الرئيسي:

```bash
# Database
DATABASE_URL=mysql://munazzamuser:MunazzamDB2024Pass!@localhost:3306/munazzamdb

# JWT Secret (generate using: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Application
FRONTEND_URL=https://your-domain.com
PORT=3000
NODE_ENV=production
```

#### الحصول على Gmail App Password

1. انتقل إلى [Google Account Security](https://myaccount.google.com/security)
2. فعّل **2-Step Verification**
3. انتقل إلى [App Passwords](https://myaccount.google.com/apppasswords)
4. أنشئ App Password جديد واستخدمه في `GMAIL_APP_PASSWORD`

#### الحصول على OpenAI API Key

1. انتقل إلى [OpenAI Platform](https://platform.openai.com/api-keys)
2. أنشئ API key جديد
3. انسخه واستخدمه في `OPENAI_API_KEY`

### الخطوة 5: بناء المشروع

```bash
pnpm build
```

### الخطوة 6: تشغيل المشروع

#### للتطوير:
```bash
pnpm dev
```

#### للإنتاج (باستخدام PM2):

```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# إنشاء ملف ecosystem.config.cjs
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'munazzam',
    script: 'server/_core/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# تشغيل PM2
pm2 start ecosystem.config.cjs

# حفظ قائمة العمليات
pm2 save

# تفعيل التشغيل التلقائي عند إعادة التشغيل
pm2 startup
```

---

## إعداد Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (if any)
    location /uploads {
        alias /path/to/munazzam/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### تفعيل SSL باستخدام Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

---

## الأوامر المفيدة

### إدارة PM2
```bash
# عرض حالة العمليات
pm2 status

# عرض logs
pm2 logs munazzam

# إعادة تشغيل
pm2 restart munazzam

# إيقاف
pm2 stop munazzam

# حذف
pm2 delete munazzam
```

### قاعدة البيانات
```bash
# تطبيق schema changes
pnpm db:push

# إنشاء migration جديد
pnpm db:generate

# عرض studio
pnpm db:studio
```

### الاختبار
```bash
# تشغيل جميع الاختبارات
pnpm test

# تشغيل اختبار محدد
pnpm test auth.logout.test.ts
```

---

## استكشاف الأخطاء

### المشكلة: لا يمكن الاتصال بقاعدة البيانات

**الحل:**
1. تحقق من أن MySQL يعمل: `sudo systemctl status mysql`
2. تحقق من `DATABASE_URL` في `.env`
3. تحقق من صلاحيات المستخدم في MySQL

### المشكلة: فشل إرسال البريد الإلكتروني

**الحل:**
1. تحقق من `GMAIL_USER` و `GMAIL_APP_PASSWORD`
2. تأكد من تفعيل 2-Step Verification في Google
3. تأكد من إنشاء App Password صحيح

### المشكلة: أخطاء OpenAI API

**الحل:**
1. تحقق من `OPENAI_API_KEY`
2. تأكد من وجود رصيد كافٍ في حساب OpenAI
3. تحقق من حدود الاستخدام (rate limits)

---

## الأمان

### توصيات الأمان

1. **تغيير كلمات المرور الافتراضية**
   - غيّر `JWT_SECRET` إلى قيمة عشوائية طويلة
   - غيّر كلمة مرور قاعدة البيانات

2. **تفعيل Firewall**
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

3. **تحديثات منتظمة**
   ```bash
   # تحديث النظام
   sudo apt update && sudo apt upgrade

   # تحديث dependencies
   pnpm update
   ```

4. **Backup منتظم**
   ```bash
   # backup قاعدة البيانات
   mysqldump -u munazzamuser -p munazzamdb > backup_$(date +%Y%m%d).sql

   # backup الملفات
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
   ```

---

## الدعم

للمساعدة أو الإبلاغ عن مشاكل:
- **GitHub Issues**: [https://github.com/amhr0/Munazzam-App/issues](https://github.com/amhr0/Munazzam-App/issues)
- **Email**: AMHR551@GMAIL.COM

---

## الترخيص

MIT License - يمكنك استخدام المشروع بحرية للأغراض التجارية وغير التجارية.
