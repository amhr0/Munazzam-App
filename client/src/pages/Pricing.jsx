import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const plans = [
        {
            name: 'مجاني',
            nameEn: 'Free',
            price: { SAR: 0, USD: 0 },
            features: [
                '5 اجتماعات شهرياً',
                '30 دقيقة تحويل صوتي',
                'تحليل AI أساسي',
                'مستخدم واحد',
                'دعم عبر البريد'
            ],
            cta: 'ابدأ مجاناً',
            highlighted: false
        },
        {
            name: 'أساسي',
            nameEn: 'Basic',
            price: { SAR: 99, USD: 26 },
            features: [
                '50 اجتماع شهرياً',
                '300 دقيقة تحويل صوتي',
                'تحليل AI متقدم',
                'تكامل التقويم',
                'تكامل البريد الإلكتروني',
                '3 مستخدمين',
                'دعم ذو أولوية'
            ],
            cta: 'اشترك الآن',
            highlighted: false
        },
        {
            name: 'احترافي',
            nameEn: 'Professional',
            price: { SAR: 299, USD: 79 },
            features: [
                '200 اجتماع شهرياً',
                '1200 دقيقة تحويل صوتي',
                'تحليل AI كامل',
                'تكامل جميع الخدمات',
                'علامة تجارية مخصصة',
                '10 مستخدمين',
                'دعم VIP',
                'تقارير مفصلة'
            ],
            cta: 'اشترك الآن',
            highlighted: true
        },
        {
            name: 'مؤسسات',
            nameEn: 'Enterprise',
            price: { SAR: 999, USD: 266 },
            features: [
                'اجتماعات غير محدودة',
                'تحويل صوتي غير محدود',
                'تحليل AI مخصص',
                'تكامل كامل',
                'علامة تجارية كاملة',
                'مستخدمين غير محدودين',
                'دعم مخصص 24/7',
                'تدريب وإعداد',
                'SLA مضمون'
            ],
            cta: 'تواصل معنا',
            highlighted: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            منظّم
                        </Link>
                        <div className="flex gap-4">
                            <Link to="/login" className="text-gray-600 hover:text-blue-600">
                                تسجيل الدخول
                            </Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                إنشاء حساب
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        خطط تسعير مرنة لكل الأحجام
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        اختر الخطة المناسبة لاحتياجاتك. جميع الخطط تشمل تجربة مجانية لمدة 14 يوماً
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl shadow-lg p-8 ${
                                plan.highlighted ? 'ring-4 ring-blue-600 transform scale-105' : ''
                            }`}
                        >
                            {plan.highlighted && (
                                <div className="bg-blue-600 text-white text-center py-2 rounded-lg mb-4 text-sm font-semibold">
                                    الأكثر شعبية
                                </div>
                            )}
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {plan.name}
                            </h3>
                            
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-gray-900">
                                    {plan.price.SAR}
                                </span>
                                <span className="text-gray-600 mr-2">ر.س</span>
                                <span className="text-gray-500 text-sm">/شهرياً</span>
                            </div>
                            
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <Link
                                to="/register"
                                className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                                    plan.highlighted
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        الأسئلة الشائعة
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="border-b pb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                هل يمكنني تغيير الخطة لاحقاً؟
                            </h3>
                            <p className="text-gray-600">
                                نعم، يمكنك الترقية أو التخفيض في أي وقت. سيتم احتساب الفرق بشكل تناسبي.
                            </p>
                        </div>
                        
                        <div className="border-b pb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                ما هي طرق الدفع المتاحة؟
                            </h3>
                            <p className="text-gray-600">
                                نقبل جميع بطاقات الائتمان الرئيسية (Visa, Mastercard, Amex) بالإضافة إلى Apple Pay و PayTabs.
                            </p>
                        </div>
                        
                        <div className="border-b pb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                هل هناك رسوم إضافية؟
                            </h3>
                            <p className="text-gray-600">
                                لا، جميع الأسعار شاملة. لا توجد رسوم خفية أو تكاليف إضافية.
                            </p>
                        </div>
                        
                        <div className="pb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                هل يمكنني إلغاء الاشتراك؟
                            </h3>
                            <p className="text-gray-600">
                                نعم، يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم. لن يتم تحصيل أي رسوم بعد الإلغاء.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2024 منظّم. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
