import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Subscription from '../models/Subscription.js';
import { buildSafeRegexFilter } from '../middleware/inputSanitization.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذه الصفحة'
    });
  }
  next();
};

// Get dashboard statistics
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMeetings = await Meeting.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Users by type
    const usersByType = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    // Subscriptions by plan
    const subscriptionsByPlan = await Subscription.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    
    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Revenue calculation (mock)
    const revenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$price.amount' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMeetings,
        activeSubscriptions,
        recentUsers,
        revenue: revenue[0]?.total || 0,
        usersByType,
        subscriptionsByPlan
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب الإحصائيات',
      error: error.message
    });
  }
});

// Get all users with pagination
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    // Use safe regex filter to prevent injection
    const filter = search ? buildSafeRegexFilter(search, ['name', 'email']) : {};
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب المستخدمين',
      error: error.message
    });
  }
});

// Get user details
router.get('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const subscription = await Subscription.findOne({ user: user._id });
    const meetings = await Meeting.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      user,
      subscription,
      recentMeetings: meetings
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب بيانات المستخدم',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, userType } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (userType) user.userType = userType;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
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
      message: 'فشل تحديث المستخدم',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // Delete user's data
    await Meeting.deleteMany({ user: user._id });
    await Subscription.deleteMany({ user: user._id });
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل حذف المستخدم',
      error: error.message
    });
  }
});

// Get all subscriptions
router.get('/subscriptions', protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Subscription.countDocuments();
    
    res.json({
      success: true,
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب الاشتراكات',
      error: error.message
    });
  }
});

// Update subscription
router.put('/subscriptions/:id', protect, isAdmin, async (req, res) => {
  try {
    const { plan, status, endDate } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'الاشتراك غير موجود'
      });
    }
    
    if (plan) subscription.plan = plan;
    if (status) subscription.status = status;
    if (endDate) subscription.endDate = new Date(endDate);
    
    await subscription.save();
    
    res.json({
      success: true,
      message: 'تم تحديث الاشتراك بنجاح',
      subscription
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل تحديث الاشتراك',
      error: error.message
    });
  }
});

// Get all meetings
router.get('/meetings', protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const meetings = await Meeting.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Meeting.countDocuments();
    
    res.json({
      success: true,
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب الاجتماعات',
      error: error.message
    });
  }
});

// System settings
router.get('/settings', protect, isAdmin, async (req, res) => {
  try {
    // In production, store settings in database
    const settings = {
      siteName: 'منظّم',
      maintenanceMode: false,
      allowRegistration: true,
      defaultTrialDays: 14,
      emailNotifications: true,
      analyticsEnabled: true
    };
    
    res.json({
      success: true,
      settings
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب الإعدادات',
      error: error.message
    });
  }
});

// Update system settings
router.put('/settings', protect, isAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    // In production, save to database
    
    res.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      settings
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل تحديث الإعدادات',
      error: error.message
    });
  }
});

export default router;
