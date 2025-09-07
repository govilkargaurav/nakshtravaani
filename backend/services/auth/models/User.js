const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(\+91|91)?[6-9]\d{9}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    timeOfBirth: String,
    placeOfBirth: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    avatar: String
  },
  birthChart: {
    sunSign: String,
    moonSign: String,
    ascendant: String,
    recalculationQueued: {
      type: Boolean,
      default: false
    },
    lastCalculated: Date
  },
  preferences: {
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      daily: { type: Boolean, default: true },
      weekly: { type: Boolean, default: false }
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    expiresAt: Date,
    autoRenew: { type: Boolean, default: false }
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    device: String,
    createdAt: { type: Date, default: Date.now }
  }],
  lastActive: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ isActive: 1, isVerified: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('profile.dateOfBirth') && !this.isModified('profile.timeOfBirth')) {
    return next();
  }
  
  if (this.profile?.dateOfBirth && this.profile?.timeOfBirth) {
    this.birthChart.recalculationQueued = true;
  }
  
  next();
});

userSchema.methods.addRefreshToken = function(token, device = 'unknown') {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    createdAt: new Date()
  });
  
  this.refreshTokens = this.refreshTokens
    .filter(rt => rt.expiresAt > new Date())
    .slice(-5);
};

userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.refreshTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);