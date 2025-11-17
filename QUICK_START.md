# البدء السريع - منظّم

## ⚡ 5 دقائق للتشغيل

### 1️⃣ المتطلبات
```bash
# تأكد من تثبيت:
node --version  # يجب أن يكون 18+
mongod --version # يجب أن يكون 5+
```

### 2️⃣ استنساخ المشروع
```bash
git clone https://github.com/amhr0/Munazzam.git
cd Munazzam
```

### 3️⃣ Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

**تعديل `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/munazzam
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-key-here
```

```bash
npm run dev
```

### 4️⃣ Frontend Setup
```bash
# في terminal جديد
cd client
npm install
cp .env.example .env
npm run dev
```

### 5️⃣ افتح المتصفح
```
http://localhost:5173
```

---

## 🎯 أول خطوات

1. **إنشاء حساب**
   - اختر نوع الحساب (أعمال أو HR)
   - أدخل البيانات

2. **إنشاء اجتماع**
   - اذهب إلى "الاجتماعات"
   - اضغط "اجتماع جديد"

3. **رفع تسجيل**
   - افتح الاجتماع
   - ارفع ملف صوتي
   - انتظر التحليل

---

## 🔑 الحصول على OpenAI Key

1. اذهب إلى: https://platform.openai.com/api-keys
2. سجل دخول أو أنشئ حساب
3. "Create new secret key"
4. انسخ المفتاح وأضفه في `.env`

---

## ❓ مشاكل شائعة

**MongoDB لا يعمل؟**
```bash
# تشغيل MongoDB
mongod

# أو باستخدام Docker
docker run -d -p 27017:27017 mongo
```

**Port مشغول؟**
```bash
# غير PORT في .env
PORT=5001
```

**CORS Error؟**
```bash
# تأكد من VITE_API_URL في client/.env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 المزيد من التفاصيل

- `README.md` - نظرة شاملة
- `SETUP_GUIDE.md` - دليل الإعداد الكامل
- `DEVELOPER_GUIDE.md` - للمطورين

---

**جاهز؟ ابدأ الآن!** 🚀
