import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Inbox = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);

    useEffect(() => {
        // Check if Google is connected
        checkGoogleConnection();
        // Load emails if connected
        if (isGoogleConnected) {
            loadEmails();
        } else {
            setLoading(false);
        }
    }, [isGoogleConnected]);

    const checkGoogleConnection = async () => {
        try {
            // TODO: Check if user has connected Google account
            setIsGoogleConnected(false);
        } catch (error) {
            console.error('Error checking Google connection:', error);
        }
    };

    const loadEmails = async () => {
        try {
            setLoading(true);
            // TODO: Fetch emails from API
            setEmails([]);
        } catch (error) {
            console.error('Error loading emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectGoogle = () => {
        // TODO: Implement Google OAuth flow
        window.location.href = '/api/auth/google';
    };

    const connectMicrosoft = () => {
        // TODO: Implement Microsoft OAuth flow
        window.location.href = '/api/auth/microsoft';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <button
                                onClick={() => navigate('/app/dashboard')}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">البريد الوارد</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!isGoogleConnected ? (
                    // Connection Screen
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                اربط حساب بريدك الإلكتروني
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                قم بربط حساب Gmail أو Outlook الخاص بك لتتمكن من قراءة وتحليل رسائل البريد الإلكتروني تلقائياً
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {/* Google Connection */}
                            <button
                                onClick={connectGoogle}
                                className="flex items-center justify-center space-x-3 space-x-reverse bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg px-6 py-4 transition-all hover:shadow-md group"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">Google</div>
                                    <div className="text-sm text-gray-500">ربط Gmail</div>
                                </div>
                            </button>

                            {/* Microsoft Connection */}
                            <button
                                onClick={connectMicrosoft}
                                className="flex items-center justify-center space-x-3 space-x-reverse bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg px-6 py-4 transition-all hover:shadow-md group"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                                </svg>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">Microsoft</div>
                                    <div className="text-sm text-gray-500">ربط Outlook</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
                            <div className="flex items-start space-x-3 space-x-reverse">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-right text-sm text-blue-900">
                                    <strong>خصوصيتك مهمة:</strong> نحن نستخدم OAuth الآمن ولا نخزن كلمات المرور. يمكنك إلغاء الربط في أي وقت.
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Emails List
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    رسائل البريد الإلكتروني
                                </h2>
                                <button
                                    onClick={loadEmails}
                                    className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>تحديث</span>
                                </button>
                            </div>
                        </div>

                        {emails.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا توجد رسائل جديدة
                                </h3>
                                <p className="text-gray-500">
                                    سيتم عرض رسائل البريد الإلكتروني هنا عند وصولها
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {emails.map((email, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                                    <span className="font-semibold text-gray-900">{email.from}</span>
                                                    {email.unread && (
                                                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-gray-800 mb-1">{email.subject}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">{email.preview}</p>
                                            </div>
                                            <span className="text-sm text-gray-500 mr-4">{email.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inbox;
