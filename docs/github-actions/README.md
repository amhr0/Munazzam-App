# إضافة GitHub Actions للمشروع

## الخطوات

نظراً لأن GitHub App لا يملك صلاحية `workflows`، يجب إضافة workflow يدوياً عبر GitHub web interface.

### الطريقة 1: عبر GitHub Web Interface

1. افتح المستودع على GitHub: https://github.com/amhr0/Munazzam-App
2. انقر على تبويب **Actions**
3. انقر على **set up a workflow yourself**
4. انسخ محتوى ملف `ci.yml` من هذا المجلد
5. الصق المحتوى في المحرر
6. اسم الملف: `.github/workflows/ci.yml`
7. انقر على **Commit changes**

### الطريقة 2: عبر Git مباشرة (إذا كان لديك صلاحيات كاملة)

```bash
# استنساخ المستودع
git clone https://github.com/amhr0/Munazzam-App.git
cd Munazzam-App

# إنشاء مجلد workflows
mkdir -p .github/workflows

# نسخ workflow file
cp docs/github-actions/ci.yml .github/workflows/

# Commit و Push
git add .github/workflows/ci.yml
git commit -m "Add GitHub Actions CI/CD pipeline"
git push origin main
```

## ما الذي يفعله Workflow؟

### 1. Test Job
- يختبر المشروع على Node.js 18.x و 20.x
- يقوم بـ TypeScript type checking
- يشغل linter
- يشغل جميع الاختبارات (unit tests)

### 2. Build Job
- يبني المشروع للإنتاج
- يرفع build artifacts (dist/) للاستخدام لاحقاً
- يعمل فقط إذا نجحت الاختبارات

### 3. Security Job
- يقوم بفحص أمني للتبعيات (pnpm audit)
- يكتشف الثغرات الأمنية في packages

## متى يعمل Workflow؟

- عند كل `push` إلى `main` أو `develop`
- عند كل `pull request` إلى `main` أو `develop`

## عرض النتائج

بعد إضافة workflow:
1. افتح تبويب **Actions** في GitHub
2. ستجد قائمة بجميع workflow runs
3. انقر على أي run لعرض التفاصيل
4. يمكنك رؤية logs لكل job

## إضافة Status Badge إلى README

بعد أول workflow run ناجح، أضف هذا إلى README.md:

```markdown
[![CI/CD](https://github.com/amhr0/Munazzam-App/actions/workflows/ci.yml/badge.svg)](https://github.com/amhr0/Munazzam-App/actions/workflows/ci.yml)
```

سيظهر badge يوضح حالة آخر build (passing/failing).
