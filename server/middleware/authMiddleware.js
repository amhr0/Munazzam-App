import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET is not defined in environment variables');
}

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token from Authorization header or cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const protect = async (req, res, next) => {
    let token;
    
    // Extract token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'غير مصرح لك بالدخول، لا يوجد توكن' 
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validate decoded token has user ID
        if (!decoded.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'توكن غير صالح' 
            });
        }
        
        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-password');
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'المستخدم غير موجود أو تم حذفه' 
            });
        }
        
        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'انتهت صلاحية التوكن، الرجاء تسجيل الدخول مرة أخرى',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'توكن غير صالح',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ 
                success: false, 
                message: 'التوكن غير صالح بعد',
                code: 'TOKEN_NOT_ACTIVE'
            });
        }
        
        // Generic error
        console.error('Authentication error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'فشل التحقق من التوكن',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Middleware to check if user has admin role
 * Must be used after protect middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح لك بالدخول'
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'غير مصرح لك بالوصول لهذا المورد، يتطلب صلاحيات المدير'
        });
    }
    
    next();
};

/**
 * Middleware to check if user has HR role or admin
 * Must be used after protect middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const hrOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح لك بالدخول'
        });
    }
    
    if (req.user.accountType !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'غير مصرح لك بالوصول لهذا المورد، يتطلب حساب HR'
        });
    }
    
    next();
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block if invalid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const optionalAuth = async (req, res, next) => {
    let token;
    
    // Extract token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    
    // If no token, continue without user
    if (!token) {
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.id) {
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
    }
    
    next();
};
