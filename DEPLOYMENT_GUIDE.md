# دليل النشر - منظّم

## 🚀 خيارات النشر

### 1. النشر على Vercel (Frontend) + Railway (Backend)

#### Frontend على Vercel

**الخطوات:**
```bash
cd client
npm install -g vercel
vercel login
vercel
```

**Environment Variables في Vercel:**
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

#### Backend على Railway

**الخطوات:**
1. اذهب إلى https://railway.app
2. "New Project" > "Deploy from GitHub repo"
3. اختر مستودع Munazzam
4. اختر `server` directory
5. أضف Environment Variables:
   ```
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

---

### 2. النشر على Heroku (Full Stack)

#### Backend

```bash
cd server
heroku create munazzam-api
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

#### Frontend

```bash
cd client
npm run build
# نشر dist/ على Netlify أو Vercel
```

---

### 3. النشر على VPS (Ubuntu)

#### تثبيت المتطلبات

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
sudo apt-get install -y mongodb

# PM2
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx
```

#### Backend Setup

```bash
cd /var/www/munazzam/server
npm install --production
cp .env.example .env
# تعديل .env

# تشغيل باستخدام PM2
pm2 start server.js --name munazzam-api
pm2 save
pm2 startup
```

#### Frontend Setup

```bash
cd /var/www/munazzam/client
npm install
npm run build

# نسخ build إلى Nginx
sudo cp -r dist/* /var/www/html/munazzam/
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/munazzam
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html/munazzam;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/munazzam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 4. النشر باستخدام Docker

#### Dockerfile للـ Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Dockerfile للـ Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/munazzam
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - mongodb

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

**التشغيل:**
```bash
docker-compose up -d
```

---

## 🗄️ قاعدة البيانات

### MongoDB Atlas (موصى به)

1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. أنشئ Cluster مجاني
3. "Database Access" > أنشئ مستخدم
4. "Network Access" > أضف IP (0.0.0.0/0 للتطوير)
5. "Connect" > احصل على Connection String
6. أضفه في Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/munazzam
   ```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Production
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/munazzam

# Security
JWT_SECRET=your-super-secret-production-key

# AI
OPENAI_API_KEY=sk-your-production-key

# OAuth (اختياري)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Frontend
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.your-domain.com/api
```

---

## 🔒 SSL/HTTPS

### باستخدام Let's Encrypt (مجاني)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
pm2 monit
pm2 logs munazzam-api
```

### Error Tracking (Sentry)

```bash
npm install @sentry/node

# في server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Railway
      run: |
        # Railway deployment commands
```

---

## ✅ Checklist قبل النشر

- [ ] تحديث `.env` بقيم الإنتاج
- [ ] تغيير `JWT_SECRET` إلى قيمة قوية
- [ ] إعداد MongoDB Atlas
- [ ] إعداد SSL Certificate
- [ ] اختبار جميع APIs
- [ ] تفعيل Rate Limiting
- [ ] إعداد Error Tracking
- [ ] إعداد Database Backups
- [ ] اختبار OAuth Flows
- [ ] تحديث CORS Origins

---

## 🆘 استكشاف الأخطاء

### Backend لا يعمل

```bash
# تحقق من logs
pm2 logs munazzam-api

# تحقق من MongoDB
mongo --eval "db.adminCommand('ping')"

# تحقق من Environment Variables
pm2 env munazzam-api
```

### Frontend لا يتصل بـ Backend

- تحقق من `VITE_API_URL`
- تحقق من CORS settings
- تحقق من SSL certificates

---

**نصيحة**: ابدأ بـ Railway/Vercel للسهولة، ثم انتقل إلى VPS عند الحاجة.
