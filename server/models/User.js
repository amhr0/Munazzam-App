import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    }
  },
  userType: {
    type: String,
    enum: ['business', 'hr'],
    required: true
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'microsoft', null]
  },
  oauthId: String,
  
  // Calendar Integrations
  calendarIntegrations: {
    google: {
      accessToken: String,
      refreshToken: String,
      enabled: { type: Boolean, default: false }
    },
    microsoft: {
      accessToken: String,
      refreshToken: String,
      enabled: { type: Boolean, default: false }
    }
  },
  
  // Email Integrations
  emailIntegrations: {
    google: {
      accessToken: String,
      refreshToken: String,
      enabled: { type: Boolean, default: false }
    },
    microsoft: {
      accessToken: String,
      refreshToken: String,
      enabled: { type: Boolean, default: false }
    }
  },
  
  // Settings
  settings: {
    autoScheduling: {
      enabled: { type: Boolean, default: true }
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true }
    }
  }

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);
