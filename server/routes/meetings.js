import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import meetingService from '../services/meetingService.js';
import fs from 'fs';
import { multerFileFilter, validateUploadedFile, sanitizeFilename } from '../middleware/fileValidation.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/recordings/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedName);
    cb(null, 'recording-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit (reduced from 100MB)
    files: 1 // Only one file at a time
  },
  fileFilter: multerFileFilter
});

// Use protect middleware
const authMiddleware = protect;

// Create meeting
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const meeting = await meetingService.createMeeting(userId, req.body);
    
    res.status(201).json({
      success: true,
      data: meeting,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all meetings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const filters = {
      type: req.query.type,
      status: req.query.status,
      isInterview: req.query.isInterview,
      limit: req.query.limit
    };
    
    const meetings = await meetingService.getUserMeetings(userId, filters);
    
    res.json({
      success: true,
      data: meetings,
      meetings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single meeting
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const meeting = await meetingService.getMeetingById(req.params.id, userId);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    res.json({
      success: true,
      data: meeting,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update meeting
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const meeting = await meetingService.updateMeeting(
      req.params.id,
      userId,
      req.body
    );
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    res.json({
      success: true,
      data: meeting,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete meeting
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const meeting = await meetingService.deleteMeeting(req.params.id, userId);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload and process recording
router.post('/:id/recording', authMiddleware, upload.single('audio'), validateUploadedFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const meeting = await meetingService.processRecording(
      req.params.id,
      req.file.path
    );
    
    res.json({
      success: true,
      data: meeting,
      meeting,
      message: 'Recording uploaded and processing started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Analyze meeting
router.post('/:id/analyze', authMiddleware, async (req, res) => {
  try {
    const meeting = await meetingService.analyzeMeeting(req.params.id);
    
    res.json({
      success: true,
      data: meeting,
      meeting,
      message: 'Meeting analyzed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update scorecard
router.patch('/:id/scorecard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const meeting = await meetingService.updateScorecard(
      req.params.id,
      userId,
      req.body.scorecard
    );
    
    res.json({
      success: true,
      data: meeting,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
