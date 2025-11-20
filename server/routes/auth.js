import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET is not defined in environment variables');
}

/**
 * Helper function to generate JWT token
 * @param {string} userId - User ID
 * @param {string} userType - User type (business/hr)
 * @returns {string} JWT token
 */
const generateToken = (userId, userType) => {
    return jwt.sign(
        { id: userId, userType },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

/**
 * Helper function to set token in httpOnly cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    
    res.cookie('token', token, cookieOptions);
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    console.log('✅ Registration request received');

    try {
        const { name, email, password, userType } = req.body;
        
        // Input validation
        if (!name || !email || !password || !userType) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال جميع الحقول المطلوبة'
            });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني غير صالح'
            });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            });
        }
        
        // User type validation
        if (!['business', 'hr'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: 'نوع المستخدم غير صالح'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'هذا البريد الإلكتروني مسجل مسبقًا'
            });
        }

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            userType
        });

        await user.save();
        
        // Generate token
        const token = generateToken(user._id, user.userType);
        
        // Set token in httpOnly cookie
        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            message: 'تم التسجيل بنجاح',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم, يرجى المحاولة لاحقًا',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    console.log('✅ Login request received');

    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور'
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists and password is correct
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.userType);
        
        // Set token in httpOnly cookie
        setTokenCookie(res, token);

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم, يرجى المحاولة لاحقًا',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                userType: req.user.userType,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
    try {
        // Clear token cookie
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        
        res.status(200).json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', protect, (req, res) => {
    try {
        // Generate new token
        const token = generateToken(req.user._id, req.user.userType);
        
        // Set new token in httpOnly cookie
        setTokenCookie(res, token);
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث التوكن بنجاح'
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
});

export default router;
