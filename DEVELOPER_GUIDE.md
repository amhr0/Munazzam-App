# دليل المطورين - منظّم

## 📚 نظرة عامة على البنية

### Frontend Architecture

```
client/
├── src/
│   ├── pages/              # صفحات التطبيق
│   │   ├── Landing.jsx     # الصفحة الرئيسية
│   │   ├── Login.jsx       # تسجيل الدخول
│   │   ├── Register.jsx    # التسجيل
│   │   ├── Dashboard.jsx   # لوحة التحكم
│   │   ├── Calendar.jsx    # التقويم
│   │   └── Meetings.jsx    # الاجتماعات
│   │
│   ├── contexts/           # React Contexts
│   │   └── AuthContext.jsx # سياق المصادقة
│   │
│   ├── services/           # خدمات API
│   │   ├── auth.js         # خدمات المصادقة
│   │   └── meeting.js      # خدمات الاجتماعات
│   │
│   ├── App.jsx             # المكون الرئيسي
│   ├── main.jsx            # نقطة الدخول
│   └── index.css           # التنسيقات العامة
│
├── public/                 # الملفات الثابتة
├── package.json
└── vite.config.js
```

### Backend Architecture

```
server/
├── models/                 # نماذج MongoDB
│   ├── User.js            # نموذج المستخدم
│   ├── Meeting.js         # نموذج الاجتماع
│   ├── CalendarEvent.js   # نموذج الحدث
│   ├── Email.js           # نموذج البريد
│   └── KnowledgeBase.js   # نموذج قاعدة المعرفة
│
├── routes/                # مسارات API
│   ├── auth.js           # مسارات المصادقة
│   ├── meetings.js       # مسارات الاجتماعات
│   ├── calendar.js       # مسارات التقويم
│   └── email.js          # مسارات البريد
│
├── services/             # خدمات الأعمال
│   ├── aiService.js      # خدمة الذكاء الاصطناعي
│   ├── calendarService.js # خدمة التقويم
│   ├── emailService.js   # خدمة البريد
│   └── meetingService.js # خدمة الاجتماعات
│
├── middleware/           # Middleware
│   └── authMiddleware.js # وسيط المصادقة
│
├── uploads/             # الملفات المرفوعة
│   └── recordings/      # التسجيلات الصوتية
│
├── server.js           # نقطة الدخول
└── package.json
```

---

## 🔧 إضافة ميزات جديدة

### إضافة صفحة جديدة

1. **إنشاء ملف الصفحة**
```jsx
// client/src/pages/NewPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* محتوى الصفحة */}
    </div>
  );
};

export default NewPage;
```

2. **إضافة المسار في App.jsx**
```jsx
import NewPage from './pages/NewPage';

// في Routes
<Route path="/app/new-page" element={<NewPage />} />
```

### إضافة API Endpoint جديد

1. **إنشاء المسار**
```javascript
// server/routes/newRoute.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    // المنطق هنا
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

2. **تسجيل المسار في server.js**
```javascript
import newRoute from './routes/newRoute.js';
app.use('/api/new-route', newRoute);
```

### إضافة نموذج MongoDB جديد

```javascript
// server/models/NewModel.js
import mongoose from 'mongoose';

const newSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // حقول أخرى...
}, {
  timestamps: true
});

export default mongoose.model('NewModel', newSchema);
```

---

## 🤖 العمل مع الذكاء الاصطناعي

### استخدام aiService

```javascript
import aiService from '../services/aiService.js';

// تحليل نص
const analysis = await aiService.analyzeMeetingTranscript(
  transcript,
  meetingTitle
);

// تحويل صوت إلى نص
const transcription = await aiService.transcribeAudio(audioFilePath);

// تحليل مقابلة
const interviewAnalysis = await aiService.analyzeInterviewTranscript(
  transcript,
  candidateName,
  position
);
```

### تخصيص Prompts

يمكنك تعديل prompts في `server/services/aiService.js`:

```javascript
const prompt = `
قم بتحليل النص التالي...

${content}

قدم النتيجة بصيغة JSON:
{
  "summary": "...",
  "insights": [...]
}
`;
```

### استخدام نماذج مختلفة

```javascript
// في aiService.js
const response = await this.client.chat.completions.create({
  model: process.env.AI_MODEL || 'gpt-4', // يمكن تغييره
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.3
});
```

---

## 📊 العمل مع قاعدة البيانات

### إنشاء سجل جديد

```javascript
import Meeting from '../models/Meeting.js';

const meeting = await Meeting.create({
  userId: req.user._id,
  title: 'اجتماع جديد',
  type: 'virtual',
  status: 'scheduled'
});
```

### الاستعلام عن البيانات

```javascript
// الحصول على جميع الاجتماعات
const meetings = await Meeting.find({ userId: req.user._id });

// الحصول على اجتماع محدد
const meeting = await Meeting.findById(meetingId);

// البحث بشروط
const completedMeetings = await Meeting.find({
  userId: req.user._id,
  status: 'completed'
}).sort({ createdAt: -1 });
```

### تحديث سجل

```javascript
const meeting = await Meeting.findByIdAndUpdate(
  meetingId,
  { status: 'completed' },
  { new: true } // لإرجاع السجل المحدث
);
```

### حذف سجل

```javascript
await Meeting.findByIdAndDelete(meetingId);
```

---

## 🔐 المصادقة والتفويض

### حماية مسار API

```javascript
import { authenticate } from '../middleware/authMiddleware.js';

router.get('/protected', authenticate, async (req, res) => {
  // req.user متاح هنا
  const userId = req.user._id;
  // ...
});
```

### الحصول على المستخدم الحالي

```javascript
// في Frontend
const { user } = useAuth();
console.log(user.name, user.userType);

// في Backend
const user = await User.findById(req.user._id);
```

### إنشاء JWT Token

```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

---

## 🎨 التنسيق والواجهة

### استخدام Tailwind CSS

```jsx
<div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
  <h3 className="text-xl font-bold text-gray-900 mb-3">
    عنوان
  </h3>
  <p className="text-gray-600">
    محتوى...
  </p>
</div>
```

### دعم RTL

```jsx
<div dir="rtl">
  {/* المحتوى العربي */}
</div>
```

### الأيقونات (Lucide React)

```jsx
import { Calendar, Mail, User } from 'lucide-react';

<Calendar className="w-6 h-6 text-blue-600" />
```

---

## 📡 طلبات API من Frontend

### استخدام Axios

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// GET
const response = await axios.get(`${API_URL}/meetings`, {
  headers: { Authorization: `Bearer ${token}` }
});

// POST
const response = await axios.post(
  `${API_URL}/meetings`,
  { title: 'اجتماع جديد' },
  { headers: { Authorization: `Bearer ${token}` } }
);

// PATCH
const response = await axios.patch(
  `${API_URL}/meetings/${id}`,
  { status: 'completed' },
  { headers: { Authorization: `Bearer ${token}` } }
);

// DELETE
await axios.delete(`${API_URL}/meetings/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🧪 الاختبار

### اختبار API باستخدام curl

```bash
# تسجيل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# الحصول على الاجتماعات
curl http://localhost:5000/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### اختبار API باستخدام Postman

1. استورد Collection من `docs/postman_collection.json` (إذا وُجد)
2. أو أنشئ requests يدوياً
3. أضف Token في Headers:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

---

## 🚀 النشر (Deployment)

### Backend (Node.js)

**Heroku:**
```bash
heroku create munazzam-api
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

**Railway:**
1. ربط GitHub repo
2. إضافة environment variables
3. Deploy تلقائياً

### Frontend (React)

**Vercel:**
```bash
npm run build
vercel --prod
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### قاعدة البيانات

**MongoDB Atlas:**
1. إنشاء Cluster مجاني
2. الحصول على Connection String
3. إضافته في MONGODB_URI

---

## 🔍 تصحيح الأخطاء (Debugging)

### Backend Logs

```javascript
console.log('Debug:', data);
console.error('Error:', error);
```

### Frontend Logs

```javascript
console.log('User:', user);
console.error('API Error:', error.response?.data);
```

### MongoDB Queries

```javascript
// تفعيل debug mode
mongoose.set('debug', true);
```

---

## 📦 إضافة حزم جديدة

### Backend

```bash
cd server
npm install package-name
```

### Frontend

```bash
cd client
npm install package-name
```

---

## 🎯 أفضل الممارسات

### 1. التعامل مع الأخطاء

```javascript
// Backend
try {
  // الكود
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: error.message
  });
}

// Frontend
try {
  const response = await axios.get(url);
} catch (error) {
  console.error('Error:', error);
  alert('حدث خطأ');
}
```

### 2. التحقق من المدخلات

```javascript
// Backend
if (!title || !type) {
  return res.status(400).json({
    success: false,
    message: 'Missing required fields'
  });
}
```

### 3. استخدام Environment Variables

```javascript
// لا تكتب القيم مباشرة
const apiKey = process.env.OPENAI_API_KEY; // ✅
const apiKey = 'sk-xxx'; // ❌
```

### 4. التعليقات والتوثيق

```javascript
/**
 * تحليل نص الاجتماع واستخراج القرارات والمهام
 * @param {string} transcript - نص الاجتماع
 * @param {string} meetingTitle - عنوان الاجتماع
 * @returns {Promise<Object>} - نتيجة التحليل
 */
async analyzeMeetingTranscript(transcript, meetingTitle) {
  // ...
}
```

---

## 📚 مصادر إضافية

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [OpenAI API](https://platform.openai.com/docs)

---

**نصيحة للمطورين**: استخدم VS Code مع extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
