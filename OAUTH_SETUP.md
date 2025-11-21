# إعداد OAuth للتكامل مع Google و Microsoft

## نظرة عامة

يحتاج نظام منظم إلى بيانات اعتماد OAuth2 للتكامل مع:
- **Google**: Calendar API و Gmail API
- **Microsoft**: Outlook Calendar و Outlook Email

## 1. إعداد Google OAuth

### الخطوات:

1. **إنشاء مشروع في Google Cloud Console**
   - اذهب إلى: https://console.cloud.google.com
   - أنشئ مشروع جديد أو اختر مشروع موجود

2. **تفعيل APIs المطلوبة**
   - اذهب إلى "APIs & Services" > "Library"
   - ابحث وفعّل:
     - Google Calendar API
     - Gmail API

3. **إنشاء OAuth 2.0 Credentials**
   - اذهب إلى "APIs & Services" > "Credentials"
   - اضغط "Create Credentials" > "OAuth client ID"
   - اختر "Web application"
   - أضف Authorized redirect URIs:
     ```
     https://your-domain.com/api/oauth/google/callback
     http://localhost:3000/api/oauth/google/callback  (للتطوير)
     ```

4. **نسخ بيانات الاعتماد**
   - احفظ `Client ID` و `Client Secret`

5. **إضافة المتغيرات البيئية**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/oauth/google/callback
   ```

### Scopes المطلوبة:
```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/gmail.readonly
```

---

## 2. إعداد Microsoft OAuth

### الخطوات:

1. **التسجيل في Azure Portal**
   - اذهب إلى: https://portal.azure.com
   - اذهب إلى "Azure Active Directory" > "App registrations"

2. **إنشاء تطبيق جديد**
   - اضغط "New registration"
   - اسم التطبيق: "Munazzam"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI (Web):
     ```
     https://your-domain.com/api/oauth/microsoft/callback
     http://localhost:3000/api/oauth/microsoft/callback  (للتطوير)
     ```

3. **إنشاء Client Secret**
   - اذهب إلى "Certificates & secrets"
   - اضغط "New client secret"
   - احفظ القيمة فورًا (لن تظهر مرة أخرى)

4. **إضافة API Permissions**
   - اذهب إلى "API permissions"
   - اضغط "Add a permission" > "Microsoft Graph"
   - اختر "Delegated permissions"
   - أضف:
     - Calendars.Read
     - Mail.Read
     - User.Read

5. **نسخ بيانات الاعتماد**
   - Application (client) ID
   - Client Secret

6. **إضافة المتغيرات البيئية**
   ```bash
   MICROSOFT_CLIENT_ID=your_client_id_here
   MICROSOFT_CLIENT_SECRET=your_client_secret_here
   MICROSOFT_REDIRECT_URI=https://your-domain.com/api/oauth/microsoft/callback
   ```

### Scopes المطلوبة:
```
https://graph.microsoft.com/Calendars.Read
https://graph.microsoft.com/Mail.Read
https://graph.microsoft.com/User.Read
```

---

## 3. إضافة المتغيرات البيئية

أضف جميع المتغيرات إلى ملف `.env` في مجلد `server`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/oauth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/oauth/microsoft/callback
```

---

## 4. اختبار التكامل

بعد إضافة بيانات الاعتماد:

1. أعد تشغيل السيرفر
2. اذهب إلى صفحة "التكاملات" في التطبيق
3. اضغط "ربط حساب Google" أو "ربط حساب Microsoft"
4. أكمل عملية المصادقة
5. بعد الربط، جرب:
   - مزامنة التقويم
   - مزامنة الإيميلات
   - تحليل الإيميلات

---

## ملاحظات أمنية

- **لا تشارك** بيانات الاعتماد أبدًا
- استخدم **HTTPS** في الإنتاج
- احفظ الـ Client Secrets في مكان آمن
- راجع أذونات التطبيق بانتظام
- استخدم **environment variables** وليس hardcoded values

---

## استكشاف الأخطاء

### خطأ "redirect_uri_mismatch"
- تأكد من أن الـ redirect URI في الكود يطابق المسجل في Google/Microsoft Console

### خطأ "invalid_client"
- تحقق من صحة Client ID و Client Secret

### خطأ "insufficient_permissions"
- تأكد من إضافة جميع الـ Scopes المطلوبة
- في Microsoft: تأكد من "Grant admin consent" إذا كان مطلوبًا

---

## الدعم

إذا واجهت أي مشاكل:
1. راجع logs السيرفر
2. تحقق من صحة بيانات الاعتماد
3. تأكد من تفعيل APIs المطلوبة
