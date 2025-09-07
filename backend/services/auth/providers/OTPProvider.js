class OTPProvider {
  async sendOTP(phoneNumber, otp) {
    throw new Error('sendOTP method must be implemented');
  }
}

module.exports = OTPProvider;