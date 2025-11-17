import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            منظّم
                        </Link>
                        <Link to="/" className="text-gray-600 hover:text-blue-600">
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    شروط الاستخدام
                </h1>
                
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            1. قبول الشروط
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            باستخدامك لخدمات منظّم، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام خدماتنا.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            2. الخدمات المقدمة
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            يوفر منظّم الخدمات التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>تسجيل وتحليل الاجتماعات بالذكاء الاصطناعي</li>
                            <li>تحليل المقابلات الوظيفية</li>
                            <li>إدارة التقويم والبريد الإلكتروني</li>
                            <li>استخراج القرارات والمهام تلقائياً</li>
                            <li>تكامل مع Google و Microsoft</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            3. التسجيل والحساب
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            عند إنشاء حساب، يجب عليك:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>تقديم معلومات دقيقة وكاملة</li>
                            <li>الحفاظ على سرية بيانات الدخول</li>
                            <li>إخطارنا فوراً بأي استخدام غير مصرح به</li>
                            <li>أن تكون فوق سن 18 عاماً</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            4. الاشتراكات والدفع
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            شروط الاشتراك والدفع:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>يتم تحصيل الرسوم شهرياً أو سنوياً حسب الخطة المختارة</li>
                            <li>التجديد التلقائي ما لم يتم الإلغاء قبل نهاية فترة الفوترة</li>
                            <li>لا يتم رد الرسوم عن الفترات غير المستخدمة</li>
                            <li>يمكن تغيير الأسعار بإشعار مسبق 30 يوماً</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            5. الاستخدام المقبول
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            يُحظر استخدام الخدمة لـ:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>أي أنشطة غير قانونية أو احتيالية</li>
                            <li>انتهاك حقوق الملكية الفكرية</li>
                            <li>نشر محتوى ضار أو مسيء</li>
                            <li>محاولة اختراق أو تعطيل الخدمة</li>
                            <li>استخدام الخدمة لأغراض تجارية دون إذن</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            6. الملكية الفكرية
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            جميع حقوق الملكية الفكرية للخدمة والمحتوى محفوظة لمنظّم. لا يجوز نسخ أو توزيع أو تعديل أي جزء من الخدمة دون إذن كتابي مسبق.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            7. البيانات والمحتوى
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            فيما يتعلق بالمحتوى الذي تحمله:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>تحتفظ بملكية جميع البيانات التي تحملها</li>
                            <li>تمنحنا ترخيصاً لمعالجة البيانات لتقديم الخدمة</li>
                            <li>أنت مسؤول عن قانونية المحتوى المحمل</li>
                            <li>نحتفظ بالحق في إزالة المحتوى المخالف</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            8. إخلاء المسؤولية
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            يتم تقديم الخدمة "كما هي" دون أي ضمانات. لا نضمن أن الخدمة ستكون خالية من الأخطاء أو متاحة دائماً. لا نتحمل المسؤولية عن أي خسائر ناتجة عن استخدام الخدمة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            9. حدود المسؤولية
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            مسؤوليتنا الإجمالية تجاهك محدودة بالمبلغ الذي دفعته لنا خلال الـ 12 شهراً السابقة. لا نتحمل المسؤولية عن أي أضرار غير مباشرة أو تبعية.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            10. الإنهاء
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            يمكننا إنهاء أو تعليق حسابك في الحالات التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>انتهاك هذه الشروط</li>
                            <li>عدم دفع الرسوم المستحقة</li>
                            <li>نشاط احتيالي أو مشبوه</li>
                            <li>بناءً على طلبك</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            11. التعديلات
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطرك بأي تغييرات جوهرية قبل 30 يوماً من سريانها.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            12. القانون الحاكم
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن هذه الشروط يخضع للاختصاص الحصري للمحاكم السعودية.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            13. اتصل بنا
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            للأسئلة حول هذه الشروط، يرجى التواصل معنا:
                        </p>
                        <div className="mt-4 text-gray-700">
                            <p>البريد الإلكتروني: legal@munazzam.com</p>
                            <p>الهاتف: +966 XX XXX XXXX</p>
                        </div>
                    </section>

                    <div className="border-t pt-8 mt-8">
                        <p className="text-sm text-gray-500">
                            آخر تحديث: 16 نوفمبر 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2024 منظّم. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Terms;
