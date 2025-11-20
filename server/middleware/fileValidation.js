import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import path from 'path';

/**
 * Allowed MIME types for audio/video files
 */
const ALLOWED_MIME_TYPES = [
    'audio/mpeg',      // .mp3
    'audio/wav',       // .wav
    'audio/x-m4a',     // .m4a
    'audio/mp4',       // .m4a alternative
    'audio/webm',      // .webm
    'video/mp4',       // .mp4 (video recordings)
    'video/webm'       // .webm (video recordings)
];

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.mp4'];

/**
 * Maximum file size (50MB)
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validate file extension
 * @param {string} filename - Original filename
 * @returns {boolean} True if extension is allowed
 */
export const validateFileExtension = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Validate file MIME type
 * @param {string} mimetype - File MIME type from multer
 * @returns {boolean} True if MIME type is allowed
 */
export const validateFileMimeType = (mimetype) => {
    return ALLOWED_MIME_TYPES.includes(mimetype);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} True if size is within limit
 */
export const validateFileSize = (size) => {
    return size <= MAX_FILE_SIZE;
};

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
    // Remove any path components
    const basename = path.basename(filename);
    
    // Remove special characters except dots, dashes, and underscores
    const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Ensure filename is not empty
    if (!sanitized || sanitized === '.') {
        return `file_${Date.now()}`;
    }
    
    return sanitized;
};

/**
 * Validate file using magic bytes (actual file content)
 * This is more secure than checking extension or MIME type
 * @param {string} filePath - Path to uploaded file
 * @returns {Promise<Object>} Validation result
 */
export const validateFileMagicBytes = async (filePath) => {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return {
                valid: false,
                error: 'الملف غير موجود'
            };
        }
        
        // Get file type from magic bytes
        const fileTypeResult = await fileTypeFromFile(filePath);
        
        // If file type cannot be determined
        if (!fileTypeResult) {
            return {
                valid: false,
                error: 'لا يمكن تحديد نوع الملف'
            };
        }
        
        // Check if MIME type is allowed
        if (!ALLOWED_MIME_TYPES.includes(fileTypeResult.mime)) {
            return {
                valid: false,
                error: `نوع الملف غير مسموح: ${fileTypeResult.mime}`
            };
        }
        
        return {
            valid: true,
            mime: fileTypeResult.mime,
            ext: fileTypeResult.ext
        };
    } catch (error) {
        console.error('Magic bytes validation error:', error);
        return {
            valid: false,
            error: 'فشل التحقق من نوع الملف'
        };
    }
};

/**
 * Middleware to validate uploaded file
 * Use this after multer middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateUploadedFile = async (req, res, next) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي ملف'
            });
        }
        
        // Validate file size
        if (!validateFileSize(req.file.size)) {
            // Delete uploaded file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            return res.status(400).json({
                success: false,
                message: `حجم الملف كبير جداً. الحد الأقصى هو ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
        
        // Validate magic bytes
        const magicBytesValidation = await validateFileMagicBytes(req.file.path);
        
        if (!magicBytesValidation.valid) {
            // Delete malicious file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            return res.status(400).json({
                success: false,
                message: magicBytesValidation.error || 'نوع الملف غير صالح'
            });
        }
        
        // Add validated file info to request
        req.validatedFile = {
            ...req.file,
            validatedMime: magicBytesValidation.mime,
            validatedExt: magicBytesValidation.ext
        };
        
        next();
    } catch (error) {
        console.error('File validation error:', error);
        
        // Delete file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من الملف'
        });
    }
};

/**
 * Multer file filter function
 * This provides initial validation before file is saved
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
export const multerFileFilter = (req, file, cb) => {
    try {
        // Check extension
        if (!validateFileExtension(file.originalname)) {
            return cb(new Error('نوع الملف غير مسموح'), false);
        }
        
        // Check MIME type
        if (!validateFileMimeType(file.mimetype)) {
            return cb(new Error('نوع الملف غير مسموح'), false);
        }
        
        // Sanitize filename
        file.originalname = sanitizeFilename(file.originalname);
        
        cb(null, true);
    } catch (error) {
        cb(error, false);
    }
};

export default {
    validateFileExtension,
    validateFileMimeType,
    validateFileSize,
    sanitizeFilename,
    validateFileMagicBytes,
    validateUploadedFile,
    multerFileFilter,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE
};
