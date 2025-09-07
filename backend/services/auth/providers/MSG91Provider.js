const axios = require('axios');
const OTPProvider = require('./OTPProvider');

class MSG91Provider extends OTPProvider {
  constructor() {
    super();
    this.apiKey = process.env.MSG91_API_KEY;
    this.templateId = process.env.MSG91_TEMPLATE_ID;
    this.baseUrl = 'https://control.msg91.com/api/v5';
  }

  async sendOTP(phoneNumber, otp) {
    try {
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/^91/, '');
      
      const response = await axios.post(`${this.baseUrl}/otp`, {
        template_id: this.templateId,
        mobile: cleanPhone,
        authkey: this.apiKey,
        otp: otp,
        country_code: '91'
      });

      if (response.data.type === 'success') {
        return {
          success: true,
          messageId: response.data.request_id,
          message: 'OTP sent successfully'
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('MSG91 OTP Error:', error.response?.data || error.message);
      throw new Error('Failed to send OTP via MSG91');
    }
  }
}

module.exports = MSG91Provider;