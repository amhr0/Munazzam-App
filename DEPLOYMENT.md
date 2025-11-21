# دليل نشر منظم على VPS

## معلومات السيرفر
- **IP**: 72.61.201.103
- **SSH**: `ssh root@72.61.201.103`
- **Panel**: https://hpanel.hostinger.com/vps/1139714/overview

## المتطلبات الأساسية

### 1. تثبيت Node.js و pnpm
```bash
# تثبيت Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت pnpm
npm install -g pnpm
```

### 2. تثبيت MySQL/MariaDB
```bash
sudo apt update
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# إنشاء قاعدة البيانات
sudo mysql -u root -p
CREATE DATABASE munazzam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'munazzam'@'localhost' IDENTIFIED BY 'كلمة_سر_قوية';
GRANT ALL PRIVILEGES ON munazzam.* TO 'munazzam'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. تثبيت Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## خطوات النشر

### 1. رفع المشروع للسيرفر
```bash
# على جهازك المحلي
cd /home/ubuntu/munazzam
tar -czf munazzam.tar.gz --exclude=node_modules --exclude=.git .
scp munazzam.tar.gz root@72.61.201.103:/root/

# على السيرفر
ssh root@72.61.201.103
mkdir -p /var/www/munazzam
cd /var/www/munazzam
tar -xzf ~/munazzam.tar.gz
```

### 2. إعداد متغيرات البيئة
```bash
cd /var/www/munazzam
nano .env
```

أضف المتغيرات التالية:
```env
# Database
DATABASE_URL=mysql://munazzam:كلمة_السر@localhost:3306/munazzam

# Server
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=YOUR_JWT_SECRET_HERE

# Manus OAuth (من لوحة تحكم Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_openid
OWNER_NAME=your_name

# AI APIs
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im

# App Info
VITE_APP_TITLE=منظم
VITE_APP_LOGO=/logo.svg
```

### 3. تثبيت التبعيات والبناء
```bash
cd /var/www/munazzam
pnpm install
pnpm db:push
pnpm build
```

### 4. إعداد PM2 للتشغيل المستمر
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
cd /var/www/munazzam
pm2 start npm --name "munazzam" -- start
pm2 save
pm2 startup
```

### 5. إعداد Nginx كـ Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/munazzam
```

أضف التكوين التالي:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # أو IP السيرفر

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
}
```

تفعيل الموقع:
```bash
sudo ln -s /etc/nginx/sites-available/munazzam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. إعداد SSL (اختياري لكن مُوصى به)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## الصيانة

### عرض السجلات
```bash
pm2 logs munazzam
```

### إعادة التشغيل
```bash
pm2 restart munazzam
```

### التحديث
```bash
cd /var/www/munazzam
git pull  # إذا كنت تستخدم Git
# أو ارفع الملفات الجديدة
pnpm install
pnpm db:push
pnpm build
pm2 restart munazzam
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
mysqldump -u munazzam -p munazzam > backup_$(date +%Y%m%d).sql

# نسخ احتياطي للملفات المرفوعة (إذا كنت تستخدم تخزين محلي)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/munazzam/uploads
```

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
pm2 status
pm2 logs munazzam --lines 100
```

### مشاكل قاعدة البيانات
```bash
mysql -u munazzam -p munazzam
SHOW TABLES;
```

### مشاكل Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## الأمان

1. **تغيير كلمات السر الافتراضية**
2. **تفعيل Firewall**:
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

3. **تحديث النظام بانتظام**:
```bash
sudo apt update && sudo apt upgrade -y
```

## الدعم

للمزيد من المساعدة، راجع:
- وثائق Manus: https://docs.manus.im
- وثائق PM2: https://pm2.keymetrics.io/docs
- وثائق Nginx: https://nginx.org/en/docs/
