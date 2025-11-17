import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'trial'
  },
  price: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'SAR' }
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  trialEndsAt: {
    type: Date
  },
  features: {
    maxMeetings: { type: Number, default: 10 },
    maxTranscriptionMinutes: { type: Number, default: 60 },
    maxUsers: { type: Number, default: 1 },
    aiAnalysis: { type: Boolean, default: true },
    calendarIntegration: { type: Boolean, default: false },
    emailIntegration: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  usage: {
    meetingsThisMonth: { type: Number, default: 0 },
    transcriptionMinutesThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paytabs', 'moyasar', null],
    default: null
  },
  paymentId: String,
  customerId: String,
  invoices: [{
    invoiceId: String,
    amount: Number,
    currency: String,
    status: String,
    paidAt: Date,
    invoiceUrl: String
  }]
}, {
  timestamps: true
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  if (this.status === 'trial' && this.trialEndsAt && this.trialEndsAt > new Date()) {
    return true;
  }
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
};

// Method to check if feature is available
subscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Method to check usage limits
subscriptionSchema.methods.canUseMeeting = function() {
  return this.usage.meetingsThisMonth < this.features.maxMeetings;
};

subscriptionSchema.methods.canUseTranscription = function(minutes) {
  return (this.usage.transcriptionMinutesThisMonth + minutes) <= this.features.maxTranscriptionMinutes;
};

// Method to increment usage
subscriptionSchema.methods.incrementUsage = async function(type, amount = 1) {
  // Reset usage if it's a new month
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.meetingsThisMonth = 0;
    this.usage.transcriptionMinutesThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  if (type === 'meeting') {
    this.usage.meetingsThisMonth += amount;
  } else if (type === 'transcription') {
    this.usage.transcriptionMinutesThisMonth += amount;
  }
  
  await this.save();
};

export default mongoose.model('Subscription', subscriptionSchema);
