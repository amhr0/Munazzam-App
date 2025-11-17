import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Advanced rate limiting for different endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة',
  standardHeaders: true,
  legacyHeaders: false
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'تم تجاوز عدد الطلبات المسموح به. يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'تم تجاوز عدد عمليات الرفع المسموح بها. يرجى المحاولة بعد ساعة',
  standardHeaders: true,
  legacyHeaders: false
});

// Sanitize user input to prevent NoSQL injection
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitized input: ${key} in ${req.path}`);
  }
});

// Security headers using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      console.error('❌ Request failed:', log);
    } else if (duration > 1000) {
      console.warn('⚠️ Slow request:', log);
    } else {
      console.log('✅ Request:', log);
    }
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('💥 Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Validate request body size
export const validateBodySize = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'حجم الطلب كبير جداً. الحد الأقصى 10 ميجابايت'
    });
  }
  
  next();
};

// CSRF protection for state-changing operations
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // In production, implement proper CSRF token validation
  // For now, just check for custom header
  const csrfToken = req.get('X-CSRF-Token');
  
  if (!csrfToken && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'رمز CSRF مفقود'
    });
  }
  
  next();
};

// IP whitelist/blacklist
const blacklistedIPs = new Set();

export const ipFilter = (req, res, next) => {
  const clientIP = req.ip;
  
  if (blacklistedIPs.has(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'تم حظر الوصول من هذا العنوان'
    });
  }
  
  next();
};

// Add IP to blacklist
export const blacklistIP = (ip) => {
  blacklistedIPs.add(ip);
  console.warn(`⚠️ IP blacklisted: ${ip}`);
};

// Remove IP from blacklist
export const whitelistIP = (ip) => {
  blacklistedIPs.delete(ip);
  console.log(`✅ IP whitelisted: ${ip}`);
};

// Audit log for sensitive operations
export const auditLog = (action) => {
  return (req, res, next) => {
    const log = {
      action,
      user: req.user?._id,
      ip: req.ip,
      timestamp: new Date(),
      details: {
        method: req.method,
        path: req.path,
        body: req.body
      }
    };
    
    // In production, save to database
    console.log('📝 Audit:', log);
    
    next();
  };
};

export default {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  sanitizeInput,
  securityHeaders,
  requestLogger,
  errorHandler,
  validateBodySize,
  csrfProtection,
  ipFilter,
  blacklistIP,
  whitelistIP,
  auditLog
};
