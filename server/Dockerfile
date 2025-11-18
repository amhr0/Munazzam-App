FROM node:18-alpine

WORKDIR /app

# نسخ ملفات package أولاً للاستفادة من Docker cache
COPY package*.json ./

# تثبيت الحزم
RUN npm install --production

# نسخ باقي الملفات
COPY . .

# إنشاء مجلد uploads إذا لم يكن موجوداً
RUN mkdir -p uploads

# تعريف المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["node", "server.js"]
