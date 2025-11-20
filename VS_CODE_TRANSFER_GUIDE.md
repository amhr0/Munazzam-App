# دليل نقل مشروع "منظّم" إلى VS Code Web

هذا الدليل يحتوي على جميع الملفات المعدلة والجديدة، مع تعليمات واضحة لنقلها إلى VS Code Web.

## 1. الملفات المعدلة

### 1.1. Frontend

#### `/client/src/services/auth.js`
```javascript
import axios from 'axios';
import { API_URL as BASE_URL } from '../config.js';

const API_URL = `${BASE_URL}/auth`;

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
```

#### `/client/src/services/meeting.js`
```javascript
import axios from 'axios';
import authService from './auth';
import { API_URL as BASE_URL } from '../config.js';

const API_URL = `${BASE_URL}/meetings`;

const getMeetings = async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
        authService.setAuthToken(token);
    }
    const response = await axios.get(API_URL);
    return response.data;
};

const createMeeting = async (meetingData) => {
    const response = await axios.post(API_URL, meetingData);
    return response.data;
};

const meetingService = {
    getMeetings,
    createMeeting,
};

export default meetingService;
```

#### `/client/Dockerfile`
```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create config.js with the correct API URL
RUN echo "export const API_URL = 'http://72.61.201.103:5000/api';" > src/config.js

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 1.2. Backend

#### `/server/.env`
```
MONGO_URI=mongodb://mongodb:27017/munazzam
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=redis
REDIS_PORT=6379
ALLOWED_ORIGINS=http://72.61.201.103:3000
FRONTEND_URL=http://72.61.201.103:3000
```

#### `/server/server.js`
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const adminRoutes = require('./routes/admin');
const calendarRoutes = require('./routes/calendar');

const inputSanitization = require('./middleware/inputSanitization');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(inputSanitization);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calendar', calendarRoutes);

// Serve uploaded files securely
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 1.3. Infrastructure

#### `/docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    env_file:
      - ./server/.env

  frontend:
    build:
      context: ./client
      args:
        VITE_API_URL: http://72.61.201.103:5000/api
    ports:
      - "3000:80"

  mongodb:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:latest

  worker:
    build: ./server
    command: node worker.js
    depends_on:
      - redis
    env_file:
      - ./server/.env

volumes:
  mongo-data:
```

## 2. الملفات الجديدة

### 2.1. Frontend

#### `/client/src/config.js`
```javascript
export const API_URL = 'http://72.61.201.103:5000/api';
```

#### `/client/src/pages/Inbox.jsx`
```jsx
import React from 'react';

const Inbox = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">البريد الوارد</h1>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500 text-center py-12">سيتم ربط بريدك الإلكتروني هنا قريباً.</p>
            </div>
        </div>
    );
};

export default Inbox;
```

### 2.2. Backend

#### `/server/services/executiveAgent.js`
```javascript
// Executive Agent (The Mastermind)
// This service will be responsible for analyzing meetings and providing insights.
console.log('Executive Agent loaded');
```

#### `/server/services/briefingService.js`
```javascript
// Briefing Service (The Morning Assistant)
// This service will send a morning summary to the user.
console.log('Briefing Service loaded');
```

#### `/server/worker.js`
```javascript
const { Worker } = require('bullmq');
require('dotenv').config();

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker('tasks', async job => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    // Add your job processing logic here
}, { connection: redisOptions });

console.log('Worker started');
```

## 3. التعليمات

1.  **افتح VS Code Web:** [https://vscode.dev/](https://vscode.dev/)
2.  **افتح مشروعك:** افتح مجلد مشروع "منظّم" من جهازك المحلي.
3.  **انسخ والصق:** انسخ محتوى كل ملف من هذا الدليل والصقه في الملف المقابل في VS Code Web.
4.  **أنشئ الملفات الجديدة:** أنشئ الملفات الجديدة في المسارات المحددة وانسخ محتواها.
5.  **احفظ التغييرات:** تأكد من حفظ جميع الملفات.
6.  **انشر التغييرات:** ارفع التغييرات إلى GitHub.
7.  **أعد بناء المشروع على السيرفر:**
    ```bash
    cd /root/Munazzam-App
    git pull origin main
    docker compose build --no-cache
    docker compose up -d
    ```

بعد هذه الخطوات، سيكون مشروعك محدثاً بالكامل وجاهزاً للاستخدام.
