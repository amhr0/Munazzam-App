import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  externalId: String, // ID from Gmail/Outlook
  
  source: {
    type: String,
    enum: ['google', 'microsoft'],
    required: true
  },
  
  subject: String,
  
  from: {
    email: String,
    name: String
  },
  
  to: [{
    email: String,
    name: String
  }],
  
  cc: [{
    email: String,
    name: String
  }],
  
  body: String,
  bodyHtml: String,
  
  receivedAt: Date,
  
  // AI Analysis
  analysis: {
    isMeetingRequest: {
      type: Boolean,
      default: false
    },
    suggestedTimeSlots: [{
      start: Date,
      end: Date
    }],
    extractedInfo: {
      topic: String,
      urgency: String,
      participants: [String]
    },
    draftReply: String
  },
  
  processed: {
    type: Boolean,
    default: false
  },
  
  userAction: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'replied', 'ignored']
  }

}, {
  timestamps: true
});

// Index for efficient queries
emailSchema.index({ userId: 1, receivedAt: -1 });
emailSchema.index({ userId: 1, 'analysis.isMeetingRequest': 1 });

export default mongoose.model('Email', emailSchema);
