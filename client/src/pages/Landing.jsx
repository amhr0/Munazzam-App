import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Brain, Users, Mic, CheckCircle, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">منظّم</h1>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            مساعدك المعرفي بالذكاء الاصطناعي
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            حوّل فوضى اتصالاتك اليومية إلى وضوح وقرارات مدروسة. منظّم يقرأ، يستمع، يحلل، ويساعدك على اتخاذ قرارات أفضل.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ابدأ مجاناً
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              جدولة تلقائية ذكية
            </h3>
            <p className="text-gray-600">
              يقرأ رسائل البريد الإلكتروني، يفهم طلبات الاجتماعات، ويقترح مواعيد مناسبة تلقائياً
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              تسجيل وتحليل الاجتماعات
            </h3>
            <p className="text-gray-600">
              يحضر اجتماعاتك، يسجلها، يحولها إلى نص، ويستخرج القرارات والمهام تلقائياً
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              تحليل المقابلات (HR)
            </h3>
            <p className="text-gray-600">
              يحلل المقابلات الوظيفية بناءً على أطر علمية، ويقدم تقييماً موضوعياً للمرشحين
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            لماذا منظّم؟
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'يوفر ساعات من وقتك الثمين كل أسبوع',
              'يحول المحادثات الطويلة إلى ملخصات موجزة',
              'يستخرج القرارات والمهام القابلة للتنفيذ',
              'يقدم تحليلاً موضوعياً للمقابلات الوظيفية',
              'يدعم اللغة العربية بشكل كامل',
              'يتكامل مع Google و Microsoft'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700 text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            جاهز لتحويل إنتاجيتك؟
          </h3>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى منظّم اليوم وابدأ في اتخاذ قرارات أفضل
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition font-medium"
          >
            ابدأ الآن مجاناً
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 منظّم. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
