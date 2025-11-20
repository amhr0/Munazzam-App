import mongoSanitize from 'express-mongo-sanitize';

/**
 * Sanitize a single string input
 * Removes MongoDB operators and escapes regex special characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    
    // Remove MongoDB operators
    let sanitized = input.replace(/\$/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
};

/**
 * Escape regex special characters in a string
 * Use this when building MongoDB $regex queries
 * @param {string} input - Input string
 * @returns {string} Escaped string safe for regex
 */
export const escapeRegex = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    
    // Escape all regex special characters
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize an object recursively
 * Removes MongoDB operators from all string values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Remove keys starting with $
        if (key.startsWith('$')) {
            continue;
        }
        
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Middleware to sanitize request body, query, and params
 * Use this before routes to prevent NoSQL injection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const sanitizeRequest = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        
        // Sanitize query
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }
        
        // Sanitize params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }
        
        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        next();
    }
};

/**
 * Build safe MongoDB regex filter
 * Use this for search queries to prevent regex injection
 * @param {string} searchTerm - Search term from user
 * @param {Array<string>} fields - Fields to search in
 * @returns {Object} MongoDB filter object
 */
export const buildSafeRegexFilter = (searchTerm, fields) => {
    if (!searchTerm || typeof searchTerm !== 'string') {
        return {};
    }
    
    // Sanitize and escape the search term
    const sanitized = sanitizeString(searchTerm);
    const escaped = escapeRegex(sanitized);
    
    if (!escaped) {
        return {};
    }
    
    // Build $or filter for multiple fields
    const orConditions = fields.map(field => ({
        [field]: { $regex: escaped, $options: 'i' }
    }));
    
    return { $or: orConditions };
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
    if (typeof id !== 'string') {
        return false;
    }
    
    // MongoDB ObjectId is 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Middleware to validate ObjectId in params
 * Use this for routes with :id parameter
 * @param {string} paramName - Name of the parameter (default: 'id')
 * @returns {Function} Express middleware function
 */
export const validateObjectIdParam = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'المعرف مطلوب'
            });
        }
        
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'المعرف غير صالح'
            });
        }
        
        next();
    };
};

/**
 * Get mongo-sanitize middleware
 * This is the main middleware from express-mongo-sanitize package
 */
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️ Sanitized key "${key}" in request from ${req.ip}`);
    }
});

export default {
    sanitizeString,
    escapeRegex,
    sanitizeObject,
    sanitizeRequest,
    buildSafeRegexFilter,
    isValidObjectId,
    validateObjectIdParam,
    mongoSanitizeMiddleware
};
