import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        if (response.data.token) {
            localStorage.setItem('userToken', response.data.token);
            setAuthToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.';
        throw new Error(message);
    }
};

const login = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        if (response.data.token) {
            localStorage.setItem('userToken', response.data.token);
            setAuthToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.';
        throw new Error(message);
    }
};

const logout = () => {
    localStorage.removeItem('userToken');
    setAuthToken(null);
    window.location.href = '/';
};

const getCurrentUser = async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
        setAuthToken(token);
    } else {
        return null;
    }
    
    try {
        const response = await axios.get(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logout();
            throw new Error('انتهت صلاحية الجلسة');
        }
        console.error("Error checking user session:", error);
        throw error;
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;