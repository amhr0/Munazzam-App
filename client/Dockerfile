# مرحلة البناء
FROM node:18-alpine AS build

# تعريف متغير البناء
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت الحزم
RUN npm install

# نسخ باقي الملفات
COPY . .

# إنشاء config.js مع API URL الصحيح
RUN echo "export const API_URL = '${VITE_API_URL}';" > src/config.js

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
