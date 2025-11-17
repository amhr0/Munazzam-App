# المساهمة في منظّم

شكراً لاهتمامك بالمساهمة في مشروع منظّم! نرحب بجميع المساهمات سواء كانت إصلاح أخطاء، إضافة ميزات جديدة، أو تحسين التوثيق.

## 📋 كيفية المساهمة

### 1. Fork المشروع

اضغط على زر "Fork" في أعلى الصفحة لإنشاء نسخة من المشروع في حسابك.

### 2. استنساخ المشروع

```bash
git clone https://github.com/YOUR_USERNAME/Munazzam.git
cd Munazzam
```

### 3. إنشاء Branch جديد

```bash
git checkout -b feature/amazing-feature
# أو
git checkout -b fix/bug-fix
```

### 4. إجراء التغييرات

قم بإجراء التغييرات المطلوبة واتبع معايير الكود الموضحة أدناه.

### 5. Commit التغييرات

```bash
git add .
git commit -m "إضافة ميزة رائعة"
```

**معايير رسائل Commit:**
- استخدم رسائل واضحة ووصفية
- ابدأ بفعل في صيغة الأمر: "إضافة"، "إصلاح"، "تحديث"
- اكتب بالعربية أو الإنجليزية (حسب تفضيلك)

أمثلة جيدة:
- ✅ "إضافة صفحة تفاصيل الاجتماع"
- ✅ "إصلاح خطأ في تحليل البريد الإلكتروني"
- ✅ "تحديث التوثيق"

أمثلة سيئة:
- ❌ "تحديث"
- ❌ "fix"
- ❌ "changes"

### 6. Push إلى GitHub

```bash
git push origin feature/amazing-feature
```

### 7. فتح Pull Request

اذهب إلى صفحة المشروع الأصلي وافتح Pull Request من branch الخاص بك.

---

## 🎯 أنواع المساهمات

### إصلاح الأخطاء (Bug Fixes)
- ابحث في Issues عن الأخطاء المفتوحة
- أو أبلغ عن خطأ جديد أولاً
- قم بإصلاح الخطأ وأرسل PR

### إضافة ميزات جديدة (New Features)
- تحقق من TODO.md للميزات المطلوبة
- أو اقترح ميزة جديدة في Issues
- ناقش الميزة قبل البدء في التطوير
- قم بتطوير الميزة وأرسل PR

### تحسين التوثيق (Documentation)
- إصلاح الأخطاء الإملائية
- تحسين الشرح
- إضافة أمثلة
- ترجمة التوثيق

### تحسين الكود (Code Improvements)
- Refactoring
- تحسين الأداء
- إضافة اختبارات
- تحسين الأمان

---

## 📝 معايير الكود

### JavaScript/React

**التنسيق:**
```javascript
// استخدم const/let بدلاً من var
const userName = 'أحمد';
let counter = 0;

// استخدم arrow functions
const handleClick = () => {
  console.log('تم الضغط');
};

// استخدم template literals
const message = `مرحباً ${userName}`;

// استخدم destructuring
const { name, email } = user;
```

**التسمية:**
```javascript
// camelCase للمتغيرات والدوال
const userName = 'أحمد';
const getUserData = () => {};

// PascalCase للمكونات
const UserProfile = () => {};

// UPPER_CASE للثوابت
const API_URL = 'http://localhost:5000';
```

**المكونات:**
```jsx
// استخدم functional components
const MyComponent = ({ title, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;
```

### CSS/Tailwind

```jsx
// استخدم Tailwind classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">عنوان</h2>
</div>

// للتنسيقات المعقدة، استخدم clsx
import clsx from 'clsx';

<div className={clsx(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}>
```

### Backend/API

```javascript
// استخدم async/await
const getData = async () => {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// معالجة الأخطاء في APIs
router.get('/endpoint', authenticate, async (req, res) => {
  try {
    const data = await service.getData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
```

---

## 🧪 الاختبار

قبل إرسال PR، تأكد من:

1. **اختبار يدوي:**
   - جرب الميزة/الإصلاح محلياً
   - تأكد من عدم كسر ميزات أخرى

2. **اختبار في المتصفحات:**
   - Chrome
   - Firefox
   - Safari (إن أمكن)

3. **اختبار الاستجابة:**
   - Desktop
   - Tablet
   - Mobile

---

## 📋 قائمة التحقق قبل PR

- [ ] الكود يعمل بدون أخطاء
- [ ] لا توجد console.log غير ضرورية
- [ ] الكود منسق بشكل صحيح
- [ ] التعليقات واضحة ومفيدة
- [ ] التوثيق محدث (إن لزم الأمر)
- [ ] لا توجد ملفات غير ضرورية
- [ ] .env.example محدث (إن لزم الأمر)

---

## 🚫 ما يجب تجنبه

- ❌ رفع ملفات .env
- ❌ رفع node_modules
- ❌ رفع API keys
- ❌ كود غير منسق
- ❌ تغييرات كبيرة بدون نقاش مسبق
- ❌ إزالة ميزات موجودة بدون سبب
- ❌ كسر التوافق مع الإصدارات السابقة

---

## 💬 التواصل

### GitHub Issues
- للأخطاء والمشاكل
- لاقتراح ميزات جديدة
- للأسئلة العامة

### Pull Requests
- للمساهمات الفعلية
- للمراجعة والنقاش

---

## 🏆 المساهمون

شكراً لجميع المساهمين في المشروع! 🎉

<!-- سيتم إضافة قائمة المساهمين تلقائياً -->

---

## 📄 الترخيص

بالمساهمة في هذا المشروع، فإنك توافق على أن مساهماتك ستكون مرخصة تحت نفس ترخيص المشروع (MIT License).

---

**شكراً لك على المساهمة في جعل منظّم أفضل!** ❤️
