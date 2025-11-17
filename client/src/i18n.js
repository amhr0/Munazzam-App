import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // Navigation
      "home": "الرئيسية",
      "features": "الميزات",
      "pricing": "التسعير",
      "about": "من نحن",
      "contact": "اتصل بنا",
      "login": "تسجيل الدخول",
      "register": "إنشاء حساب",
      "logout": "تسجيل الخروج",
      
      // Landing Page
      "hero.title": "مساعدك المعرفي بالذكاء الاصطناعي",
      "hero.subtitle": "حوّل فوضى اتصالاتك اليومية إلى وضوح وقرارات مدروسة. منظّم يقرأ، يستمع، يحلل، ويساعدك على اتخاذ قرارات أفضل.",
      "hero.cta": "ابدأ مجاناً",
      
      // Features
      "features.scheduling": "جدولة تلقائية ذكية",
      "features.scheduling.desc": "يقرأ رسائل البريد الإلكتروني، يفهم طلبات الاجتماعات، ويقترح مواعيد مناسبة تلقائياً",
      "features.meetings": "تسجيل وتحليل الاجتماعات",
      "features.meetings.desc": "يحضر اجتماعاتك، يسجلها، يحولها إلى نص، ويستخرج القرارات والمهام تلقائياً",
      "features.interviews": "تحليل المقابلات (HR)",
      "features.interviews.desc": "يحلل المقابلات الوظيفية بناءً على أطر علمية، ويقدم تقييماً موضوعياً للمرشحين",
      
      // Dashboard
      "dashboard.title": "لوحة التحكم",
      "dashboard.welcome": "مرحباً",
      "dashboard.overview": "نظرة عامة على نشاطاتك اليوم",
      "dashboard.upcomingMeetings": "الاجتماعات القادمة",
      "dashboard.newMeetingRequests": "طلبات اجتماعات جديدة",
      "dashboard.quickActions": "إجراءات سريعة",
      "dashboard.calendar": "التقويم",
      "dashboard.meetings": "الاجتماعات",
      "dashboard.inbox": "البريد الوارد",
      
      // Meetings
      "meetings.title": "الاجتماعات",
      "meetings.new": "اجتماع جديد",
      "meetings.startRecording": "بدء تسجيل حضوري",
      "meetings.create": "إنشاء اجتماع جديد",
      "meetings.noMeetings": "لا توجد اجتماعات حتى الآن",
      "meetings.createFirst": "إنشاء اجتماع جديد",
      
      // Auth
      "auth.loginTitle": "تسجيل الدخول إلى حسابك",
      "auth.registerTitle": "إنشاء حساب جديد",
      "auth.email": "البريد الإلكتروني",
      "auth.password": "كلمة المرور",
      "auth.fullName": "الاسم الكامل",
      "auth.accountType": "نوع الحساب",
      "auth.business": "منظّم أعمال (للاجتماعات)",
      "auth.noAccount": "ليس لديك حساب؟",
      "auth.hasAccount": "هل لديك حساب بالفعل؟",
      
      // Common
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "edit": "تعديل",
      "back": "رجوع",
      "next": "التالي",
      "submit": "إرسال",
      "loading": "جاري التحميل...",
      "error": "حدث خطأ",
      "success": "تمت العملية بنجاح",
      
      // Footer
      "footer.rights": "جميع الحقوق محفوظة",
      "footer.privacy": "سياسة الخصوصية",
      "footer.terms": "شروط الاستخدام",
      "footer.support": "الدعم"
    }
  },
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "features": "Features",
      "pricing": "Pricing",
      "about": "About",
      "contact": "Contact",
      "login": "Login",
      "register": "Sign Up",
      "logout": "Logout",
      
      // Landing Page
      "hero.title": "Your AI-Powered Knowledge Assistant",
      "hero.subtitle": "Transform your daily communication chaos into clarity and informed decisions. Munazzam reads, listens, analyzes, and helps you make better decisions.",
      "hero.cta": "Get Started Free",
      
      // Features
      "features.scheduling": "Smart Automatic Scheduling",
      "features.scheduling.desc": "Reads emails, understands meeting requests, and automatically suggests suitable times",
      "features.meetings": "Meeting Recording & Analysis",
      "features.meetings.desc": "Attends your meetings, records them, transcribes, and automatically extracts decisions and tasks",
      "features.interviews": "Interview Analysis (HR)",
      "features.interviews.desc": "Analyzes job interviews based on scientific frameworks and provides objective candidate assessments",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.welcome": "Welcome",
      "dashboard.overview": "Overview of your activities today",
      "dashboard.upcomingMeetings": "Upcoming Meetings",
      "dashboard.newMeetingRequests": "New Meeting Requests",
      "dashboard.quickActions": "Quick Actions",
      "dashboard.calendar": "Calendar",
      "dashboard.meetings": "Meetings",
      "dashboard.inbox": "Inbox",
      
      // Meetings
      "meetings.title": "Meetings",
      "meetings.new": "New Meeting",
      "meetings.startRecording": "Start In-Person Recording",
      "meetings.create": "Create New Meeting",
      "meetings.noMeetings": "No meetings yet",
      "meetings.createFirst": "Create a new meeting",
      
      // Auth
      "auth.loginTitle": "Login to Your Account",
      "auth.registerTitle": "Create New Account",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.fullName": "Full Name",
      "auth.accountType": "Account Type",
      "auth.business": "Business Organizer (for meetings)",
      "auth.noAccount": "Don't have an account?",
      "auth.hasAccount": "Already have an account?",
      
      // Common
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "back": "Back",
      "next": "Next",
      "submit": "Submit",
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Operation successful",
      
      // Footer
      "footer.rights": "All rights reserved",
      "footer.privacy": "Privacy Policy",
      "footer.terms": "Terms of Service",
      "footer.support": "Support"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
