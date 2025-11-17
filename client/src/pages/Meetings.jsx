import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mic, Upload, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Meetings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recording, setRecording] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMeetings(response.data.meetings || response.data.data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/meetings`, meetingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchMeetings();
      setShowCreateModal(false);
      alert('تم إنشاء الاجتماع بنجاح!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('حدث خطأ في إنشاء الاجتماع');
    }
  };

  const deleteMeeting = async (meetingId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchMeetings();
      alert('تم حذف الاجتماع بنجاح!');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('حدث خطأ في حذف الاجتماع');
    }
  };

  const startRecording = () => {
    setRecording(true);
    // In a real implementation, this would use MediaRecorder API
    alert('سيتم تفعيل التسجيل قريباً. استخدم زر رفع الملف لتحميل تسجيل موجود.');
    setRecording(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'scheduled': 'مجدول',
      'in-progress': 'جاري',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">الاجتماعات</h1>
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                disabled={recording}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <Mic className={`w-4 h-4 ${recording ? 'animate-pulse' : ''}`} />
                {recording ? 'جاري التسجيل...' : 'بدء تسجيل حضوري'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                اجتماع جديد
              </button>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meetings List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              جاري التحميل...
            </div>
          ) : meetings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">لا توجد اجتماعات حتى الآن</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                إنشاء اجتماع جديد
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {getStatusText(meeting.status)}
                        </span>
                        {meeting.isInterview && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            مقابلة توظيف
                          </span>
                        )}
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-600 mb-2">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {meeting.scheduledTime?.start && (
                          <span>
                            📅 {new Date(meeting.scheduledTime.start).toLocaleString('ar-SA')}
                          </span>
                        )}
                        {meeting.platform && (
                          <span>
                            💻 {meeting.platform}
                          </span>
                        )}
                        {meeting.participants?.length > 0 && (
                          <span>
                            👥 {meeting.participants.length} مشارك
                          </span>
                        )}
                      </div>

                      {meeting.recording?.status === 'completed' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ تم التحليل - التقرير جاهز
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/app/meetings/${meeting._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createMeeting}
          isHR={user?.userType === 'hr'}
        />
      )}
    </div>
  );
};

// Create Meeting Modal Component
const CreateMeetingModal = ({ onClose, onCreate, isHR }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'virtual',
    platform: 'zoom',
    isInterview: false,
    scheduledTime: {
      start: '',
      end: ''
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">اجتماع جديد</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عنوان الاجتماع
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              النوع
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="virtual">افتراضي</option>
              <option value="in-person">حضوري</option>
              {isHR && <option value="interview">مقابلة توظيف</option>}
            </select>
          </div>

          {formData.type === 'virtual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنصة
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="zoom">Zoom</option>
                <option value="google-meet">Google Meet</option>
                <option value="microsoft-teams">Microsoft Teams</option>
              </select>
            </div>
          )}

          {isHR && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isInterview"
                checked={formData.isInterview}
                onChange={(e) => setFormData({ ...formData, isInterview: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isInterview" className="text-sm font-medium text-gray-700">
                هذه مقابلة توظيف
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              إنشاء
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Meetings;
