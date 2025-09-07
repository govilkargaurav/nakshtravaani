const User = require('./models/User');
const OTP = require('./models/OTP');
const { createOTPProvider } = require('./providers');
const { generateTokenPair, verifyRefreshToken } = require('../../utils/jwt');
const { asyncHandler } = require('../../middleware/error');

const otpProvider = createOTPProvider();

const generateOTP = () => {
  if (process.env.NODE_ENV === 'development' && process.env.DUMMY_OTP) {
    return process.env.DUMMY_OTP;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizePhoneNumber = (phoneNumber) => {
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  throw new Error('Invalid phone number format');
};

const sendOTP = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: { message: 'Phone number is required' }
    });
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  const existingOTP = await OTP.findOne({
    phoneNumber: normalizedPhone,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (existingOTP) {
    const timeLeft = Math.ceil((existingOTP.expiresAt - new Date()) / 1000);
    return res.status(429).json({
      success: false,
      error: { 
        message: `OTP already sent. Please wait ${timeLeft} seconds before requesting again.`,
        timeLeft
      }
    });
  }

  const otp = generateOTP();
  
  try {
    await otpProvider.sendOTP(normalizedPhone, otp);
    
    await OTP.create({
      phoneNumber: normalizedPhone,
      otp
    });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: normalizedPhone,
        expiresIn: parseInt(process.env.OTP_EXPIRES_IN) || 300000,
        ...(process.env.NODE_ENV === 'development' && { otp })
      }
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send OTP' }
    });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      error: { message: 'Phone number and OTP are required' }
    });
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  const otpRecord = await OTP.findOne({
    phoneNumber: normalizedPhone,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired OTP' }
    });
  }

  if (!otpRecord.canRetry()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Maximum OTP verification attempts exceeded' }
    });
  }

  otpRecord.attempts += 1;

  if (otpRecord.otp !== otp) {
    await otpRecord.save();
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid OTP' }
    });
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  let user = await User.findOne({ phoneNumber: normalizedPhone });
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      phoneNumber: normalizedPhone,
      isVerified: true,
      lastActive: new Date()
    });
    isNewUser = true;
  } else {
    user.isVerified = true;
    user.lastActive = new Date();
    await user.save();
  }

  const tokens = generateTokenPair(user);
  user.addRefreshToken(tokens.refreshToken, req.headers['user-agent'] || 'unknown');
  await user.save();

  res.json({
    success: true,
    message: isNewUser ? 'Registration successful' : 'Login successful',
    data: {
      user: user.toJSON(),
      tokens,
      isNewUser
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: 'Refresh token is required' }
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    const tokenExists = user.refreshTokens.some(rt => 
      rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    const tokens = generateTokenPair(user);
    
    user.removeRefreshToken(refreshToken);
    user.addRefreshToken(tokens.refreshToken, req.headers['user-agent'] || 'unknown');
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' }
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        user.removeRefreshToken(refreshToken);
        await user.save();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout
};