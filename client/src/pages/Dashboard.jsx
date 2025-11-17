import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Mail, 
  Mic, 
  Users, 
  BarChart3,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    meetings: 0,
    emails: 0,
    interviews: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHR = user?.userType === 'hr';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">منظّم</h1>
              <p className="text-sm text-gray-600">
                {isHR ? 'منظّم للموارد البشرية' : 'منظّم أعمال'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/app/settings')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.name}
          </h2>
          <p className="text-gray-600">
            إليك نظرة عامة على نشاطاتك اليوم
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.meetings}</span>
            </div>
            <h3 className="text-gray-600 font-medium">الاجتماعات القادمة</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.emails}</span>
            </div>
            <h3 className="text-gray-600 font-medium">طلبات اجتماعات جديدة</h3>
          </div>

          {isHR && (
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.interviews}</span>
              </div>
              <h3 className="text-gray-600 font-medium">المقابلات المكتملة</h3>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/app/calendar')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="font-medium text-gray-900">التقويم</span>
            </button>

            <button
              onClick={() => navigate('/app/meetings')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <Mic className="w-8 h-8 text-purple-600" />
              <span className="font-medium text-gray-900">الاجتماعات</span>
            </button>

            <button
              onClick={() => navigate('/app/emails')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
            >
              <Mail className="w-8 h-8 text-green-600" />
              <span className="font-medium text-gray-900">البريد الوارد</span>
            </button>

            {isHR && (
              <button
                onClick={() => navigate('/app/analytics')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
              >
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <span className="font-medium text-gray-900">التحليلات</span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">النشاط الأخير</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">لا توجد أنشطة حديثة</p>
                <p className="text-sm text-gray-600">ابدأ بإضافة اجتماع أو ربط بريدك الإلكتروني</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
