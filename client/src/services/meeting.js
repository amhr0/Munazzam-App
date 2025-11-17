import axios from 'axios';
import authService from './auth';

const API_URL = 'http://localhost:5000/api/meetings';

const getMeetings = async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
        authService.setAuthToken(token);
    }

    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('فشل جلب الاجتماعات');
        }
    }
};

const createMeeting = async (meetingData) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        authService.setAuthToken(token);
    }

    try {
        const response = await axios.post(API_URL, meetingData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('فشل إنشاء الاجتماع');
        }
    }
};

const meetingService = {
    getMeetings,
    createMeeting,
};

export default meetingService;