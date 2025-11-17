import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    console.log('✅ Registration request received. Body:', req.body); 

    try {
        const { name, email, password, userType } = req.body; 

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'هذا البريد الإلكتروني مسجل مسبقًا' 
            });
        }

        const user = new User({
            name,
            email,
            password,
            userType
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, userType: user.userType }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' } 
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم, يرجى المحاولة لاحقًا',
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    console.log('✅ Login request received. Body:', req.body);

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم, يرجى المحاولة لاحقًا',
            error: error.message
        });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
});

export default router;