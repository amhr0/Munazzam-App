import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userType: 'business'
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password, formData.userType);
            navigate('/app/dashboard');
        } catch (error) {
            alert(`فشل التسجيل: ${error.message || 'يرجى التحقق من البيانات المدخلة'}`);
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
                <div>
                    <Briefcase className="mx-auto h-12 w-auto text-blue-600" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        إنشاء حساب جديد
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="الاسم الكامل"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="البريد الإلكتروني"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="كلمة المرور"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                نوع الحساب:
                            </label>
                            <select
                                name="userType"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.userType}
                                onChange={handleChange}
                            >
                                <option value="business">منظّم أعمال (للاجتماعات)</option>
                                <option value="hr">منظّم للموارد البشرية (لتحليل المقابلات)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        إنشاء الحساب
                    </button>
                </form>

                <div className="text-sm text-center">
                    <p className="font-medium text-gray-600">
                        هل لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-500">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;