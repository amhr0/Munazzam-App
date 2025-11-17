import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  
  type: {
    type: String,
    enum: ['virtual', 'in-person', 'interview'],
    required: true
  },
  
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'microsoft-teams', 'in-person', 'other']
  },
  
  meetingLink: String,
  
  scheduledTime: {
    start: Date,
    end: Date
  },
  
  duration: Number, // in minutes
  
  participants: [{
    name: String,
    email: String,
    role: String
  }],
  
  // Recording
  recording: {
    audioUrl: String,
    videoUrl: String,
    transcription: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    }
  },
  
  // Analysis
  analysis: {
    summary: String,
    decisions: [String],
    actionItems: [{
      task: String,
      assignee: String,
      deadline: Date
    }],
    
    // HR-specific analysis
    behavioralAnalysis: {
      speechRate: Number, // words per minute
      confidenceScore: Number, // 0-100
      fillerWordsPercentage: Number,
      emotionalTone: String,
      clarity: Number
    },
    
    ragInsights: [String],
    
    scorecard: [{
      competency: String,
      score: Number, // 1-5
      notes: String,
      aiSuggestion: String
    }]
  },
  
  // HR Interview specific
  isInterview: {
    type: Boolean,
    default: false
  },
  
  hrAnalysis: {
    candidateName: String,
    position: String,
    overallScore: Number,
    strengths: [String],
    weaknesses: [String],
    recommendation: String
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }

}, {
  timestamps: true
});

export default mongoose.model('Meeting', meetingSchema);
