import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
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
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  location: String,
  
  source: {
    type: String,
    enum: ['google', 'microsoft', 'manual'],
    required: true
  },
  
  externalId: String, // ID from Google/Microsoft
  
  attendees: [{
    email: String,
    name: String,
    responseStatus: String
  }],
  
  reminders: [{
    method: String,
    minutes: Number
  }],
  
  color: String,
  
  isAllDay: {
    type: Boolean,
    default: false
  },
  
  recurring: {
    isRecurring: Boolean,
    frequency: String,
    interval: Number,
    endDate: Date
  },
  
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }

}, {
  timestamps: true
});

// Index for efficient queries
calendarEventSchema.index({ userId: 1, startTime: 1 });
calendarEventSchema.index({ userId: 1, source: 1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);
