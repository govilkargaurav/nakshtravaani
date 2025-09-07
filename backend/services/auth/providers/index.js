const DummyOTPProvider = require('./DummyOTPProvider');
const MSG91Provider = require('./MSG91Provider');

function createOTPProvider() {
  const provider = process.env.SMS_PROVIDER || 'dummy';
  
  switch (provider.toLowerCase()) {
    case 'msg91':
      return new MSG91Provider();
    case 'dummy':
    default:
      return new DummyOTPProvider();
  }
}

module.exports = { createOTPProvider };