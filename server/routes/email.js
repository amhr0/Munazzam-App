import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import emailService from '../services/emailService.js';
import User from '../models/User.js';

const router = express.Router();

// Fetch and analyze emails
router.post('/fetch', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.emailIntegrations?.google?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Email integration not enabled'
      });
    }

    const result = await emailService.fetchAndAnalyzeGmail(user);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get unprocessed meeting requests
router.get('/meeting-requests', protect, async (req, res) => {
  try {
    const emails = await emailService.getUnprocessedMeetingRequests(req.user._id);
    
    res.json({
      success: true,
      emails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send reply
router.post('/reply/:emailId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { replyText } = req.body;
    
    const result = await emailService.sendGmailReply(
      user,
      req.params.emailId,
      replyText
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark email as processed
router.patch('/:emailId/process', protect, async (req, res) => {
  try {
    const { action } = req.body;
    
    const email = await emailService.markAsProcessed(
      req.params.emailId,
      action
    );
    
    res.json({
      success: true,
      email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
