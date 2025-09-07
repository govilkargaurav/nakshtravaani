const OTPProvider = require('./OTPProvider');

class DummyOTPProvider extends OTPProvider {
  async sendOTP(phoneNumber, otp) {
    console.log(`📱 Dummy OTP Provider: Sending OTP ${otp} to ${phoneNumber}`);
    
    return {
      success: true,
      messageId: `dummy_${Date.now()}`,
      message: 'OTP sent successfully (dummy)'
    };
  }
}

module.exports = DummyOTPProvider;