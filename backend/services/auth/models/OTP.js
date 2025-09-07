const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(\+91|91)?[6-9]\d{9}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN) || 300000);
    }
  }
}, {
  timestamps: true
});

otpSchema.index({ phoneNumber: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

otpSchema.methods.canRetry = function() {
  return this.attempts < 3;
};

module.exports = mongoose.model('OTP', otpSchema);