# مرحلة البناء
FROM node:18-alpine AS build

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت الحزم
RUN npm install

# نسخ باقي الملفات
COPY . .

# بناء التطبيق للإنتاج
RUN npm run build

# مرحلة الإنتاج باستخدام Nginx
FROM nginx:stable-alpine

# نسخ ملفات البناء
COPY --from=build /app/dist /usr/share/nginx/html

# نسخ ملف إعدادات Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# تعريف المنفذ
EXPOSE 80

# تشغيل Nginx
CMD ["nginx", "-g", "daemon off;"]
