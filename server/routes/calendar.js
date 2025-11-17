import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import calendarService from '../services/calendarService.js';
import User from '../models/User.js';

const router = express.Router();

// Sync Google Calendar
router.post('/sync/google', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.calendarIntegrations?.google?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar integration not enabled'
      });
    }

    const result = await calendarService.syncGoogleCalendar(user);
    
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

// Sync Microsoft Calendar
router.post('/sync/microsoft', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.calendarIntegrations?.microsoft?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Microsoft Calendar integration not enabled'
      });
    }

    const result = await calendarService.syncMicrosoftCalendar(user);
    
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

// Get all events
router.get('/events', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await calendarService.getUserEvents(
      req.user._id,
      startDate,
      endDate
    );
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create event
router.post('/events', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const event = await calendarService.createEvent(user, req.body);
    
    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Find available time slots
router.get('/available-slots', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { duration = 60, count = 3 } = req.query;
    
    const slots = await calendarService.findAvailableTimeSlots(
      user,
      parseInt(duration),
      parseInt(count)
    );
    
    res.json({
      success: true,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
