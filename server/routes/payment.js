import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// Pricing plans configuration
const PLANS = {
  free: {
    name: 'مجاني',
    nameEn: 'Free',
    price: { SAR: 0, USD: 0 },
    features: {
      maxMeetings: 5,
      maxTranscriptionMinutes: 30,
      maxUsers: 1,
      aiAnalysis: true,
      calendarIntegration: false,
      emailIntegration: false,
      customBranding: false,
      prioritySupport: false
    }
  },
  basic: {
    name: 'أساسي',
    nameEn: 'Basic',
    price: { SAR: 99, USD: 26 },
    features: {
      maxMeetings: 50,
      maxTranscriptionMinutes: 300,
      maxUsers: 3,
      aiAnalysis: true,
      calendarIntegration: true,
      emailIntegration: true,
      customBranding: false,
      prioritySupport: false
    }
  },
  professional: {
    name: 'احترافي',
    nameEn: 'Professional',
    price: { SAR: 299, USD: 79 },
    features: {
      maxMeetings: 200,
      maxTranscriptionMinutes: 1200,
      maxUsers: 10,
      aiAnalysis: true,
      calendarIntegration: true,
      emailIntegration: true,
      customBranding: true,
      prioritySupport: true
    }
  },
  enterprise: {
    name: 'مؤسسات',
    nameEn: 'Enterprise',
    price: { SAR: 999, USD: 266 },
    features: {
      maxMeetings: -1, // unlimited
      maxTranscriptionMinutes: -1, // unlimited
      maxUsers: -1, // unlimited
      aiAnalysis: true,
      calendarIntegration: true,
      emailIntegration: true,
      customBranding: true,
      prioritySupport: true
    }
  }
};

// Get all pricing plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: PLANS
  });
});

// Get current user subscription
router.get('/subscription', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      // Create free trial subscription
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial
      
      subscription = new Subscription({
        user: req.user._id,
        plan: 'free',
        status: 'trial',
        trialEndsAt,
        features: PLANS.free.features
      });
      await subscription.save();
    }
    
    res.json({
      success: true,
      subscription: {
        ...subscription.toObject(),
        isActive: subscription.isActive(),
        planDetails: PLANS[subscription.plan]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب معلومات الاشتراك',
      error: error.message
    });
  }
});

// Create checkout session (Stripe)
router.post('/checkout/stripe', protect, async (req, res) => {
  try {
    const { plan, billingCycle, currency } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'خطة غير صالحة'
      });
    }
    
    // In production, integrate with Stripe API
    // For now, return mock checkout URL
    const checkoutUrl = `https://checkout.stripe.com/mock?plan=${plan}&cycle=${billingCycle}`;
    
    res.json({
      success: true,
      checkoutUrl,
      message: 'يرجى إكمال عملية الدفع عبر Stripe'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل إنشاء جلسة الدفع',
      error: error.message
    });
  }
});

// Create checkout session (PayTabs)
router.post('/checkout/paytabs', protect, async (req, res) => {
  try {
    const { plan, billingCycle, currency } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'خطة غير صالحة'
      });
    }
    
    const planDetails = PLANS[plan];
    const amount = planDetails.price[currency || 'SAR'];
    
    // In production, integrate with PayTabs API
    // For now, return mock payment URL
    const paymentUrl = `https://secure.paytabs.com/mock?amount=${amount}&currency=${currency}`;
    
    res.json({
      success: true,
      paymentUrl,
      message: 'يرجى إكمال عملية الدفع عبر PayTabs'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل إنشاء جلسة الدفع',
      error: error.message
    });
  }
});

// Webhook handler for Stripe
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In production, verify webhook signature
    const event = req.body;
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Update subscription
      const subscription = await Subscription.findOne({ customerId: session.customer });
      if (subscription) {
        subscription.status = 'active';
        subscription.paymentProvider = 'stripe';
        subscription.paymentId = session.payment_intent;
        await subscription.save();
      }
    }
    
    res.json({ received: true });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook handler for PayTabs
router.post('/webhook/paytabs', async (req, res) => {
  try {
    const { payment_result, cart_id, tran_ref } = req.body;
    
    if (payment_result.response_status === 'A') {
      // Payment approved
      const subscription = await Subscription.findOne({ paymentId: cart_id });
      if (subscription) {
        subscription.status = 'active';
        subscription.paymentProvider = 'paytabs';
        await subscription.save();
      }
    }
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upgrade subscription
router.post('/upgrade', protect, async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'خطة غير صالحة'
      });
    }
    
    let subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      subscription = new Subscription({ user: req.user._id });
    }
    
    subscription.plan = plan;
    subscription.billingCycle = billingCycle;
    subscription.features = PLANS[plan].features;
    subscription.status = 'active';
    
    const endDate = new Date();
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    subscription.endDate = endDate;
    
    await subscription.save();
    
    res.json({
      success: true,
      message: 'تم ترقية الاشتراك بنجاح',
      subscription
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل ترقية الاشتراك',
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/cancel', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد اشتراك نشط'
      });
    }
    
    subscription.status = 'cancelled';
    await subscription.save();
    
    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل إلغاء الاشتراك',
      error: error.message
    });
  }
});

// Get usage statistics
router.get('/usage', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد اشتراك'
      });
    }
    
    const usagePercentage = {
      meetings: subscription.features.maxMeetings > 0 
        ? (subscription.usage.meetingsThisMonth / subscription.features.maxMeetings) * 100 
        : 0,
      transcription: subscription.features.maxTranscriptionMinutes > 0
        ? (subscription.usage.transcriptionMinutesThisMonth / subscription.features.maxTranscriptionMinutes) * 100
        : 0
    };
    
    res.json({
      success: true,
      usage: subscription.usage,
      limits: {
        maxMeetings: subscription.features.maxMeetings,
        maxTranscriptionMinutes: subscription.features.maxTranscriptionMinutes
      },
      usagePercentage
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب إحصائيات الاستخدام',
      error: error.message
    });
  }
});

export default router;
