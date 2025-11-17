import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
                    سياسة الخصوصية
                </h1>
                
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            1. المقدمة
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            نحن في منظّم نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام خدماتنا.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            2. المعلومات التي نجمعها
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            نقوم بجمع الأنواع التالية من المعلومات:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور</li>
                            <li>معلومات الاجتماعات: التسجيلات الصوتية، النصوص، التحليلات</li>
                            <li>معلومات التقويم: المواعيد، الأحداث، المشاركين</li>
                            <li>معلومات البريد الإلكتروني: الرسائل، المرفقات</li>
                            <li>معلومات الاستخدام: سجلات النشاط، التفضيلات</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            3. كيفية استخدام المعلومات
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            نستخدم معلوماتك للأغراض التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>تقديم وتحسين خدماتنا</li>
                            <li>تحليل الاجتماعات والمقابلات بالذكاء الاصطناعي</li>
                            <li>إدارة حسابك واشتراكك</li>
                            <li>إرسال إشعارات وتحديثات مهمة</li>
                            <li>تحسين تجربة المستخدم</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            4. حماية البيانات
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            نتخذ إجراءات أمنية صارمة لحماية بياناتك:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>تشفير البيانات أثناء النقل والتخزين (SSL/TLS)</li>
                            <li>مصادقة ثنائية العوامل (2FA)</li>
                            <li>نسخ احتياطي منتظم للبيانات</li>
                            <li>مراقبة أمنية على مدار الساعة</li>
                            <li>التزام بمعايير ISO 27001</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            5. مشاركة المعلومات
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6 mt-4">
                            <li>بموافقتك الصريحة</li>
                            <li>لتقديم الخدمات المطلوبة (مثل معالجة الدفع)</li>
                            <li>للامتثال للقوانين والأنظمة</li>
                            <li>لحماية حقوقنا وسلامة المستخدمين</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            6. حقوقك
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            لديك الحقوق التالية فيما يتعلق ببياناتك:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                            <li>الوصول إلى بياناتك الشخصية</li>
                            <li>تصحيح البيانات غير الدقيقة</li>
                            <li>حذف بياناتك</li>
                            <li>تقييد معالجة بياناتك</li>
                            <li>نقل بياناتك إلى خدمة أخرى</li>
                            <li>الاعتراض على معالجة بياناتك</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            7. الكوكيز وتقنيات التتبع
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            نستخدم الكوكيز وتقنيات مشابهة لتحسين تجربتك وتحليل استخدام الموقع. يمكنك التحكم في الكوكيز من خلال إعدادات المتصفح.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            8. الاحتفاظ بالبيانات
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            نحتفظ ببياناتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. يمكنك طلب حذف بياناتك في أي وقت.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            9. خصوصية الأطفال
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            خدماتنا غير موجهة للأطفال دون سن 18 عاماً. لا نجمع معلومات شخصية من الأطفال عن قصد.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            10. التغييرات على هذه السياسة
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال الموقع.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            11. اتصل بنا
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا:
                        </p>
                        <div className="mt-4 text-gray-700">
                            <p>البريد الإلكتروني: privacy@munazzam.com</p>
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

export default Privacy;
