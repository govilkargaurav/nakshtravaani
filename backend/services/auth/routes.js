const express = require('express');
const { sendOTP, verifyOTP, refreshToken, logout } = require('./controller');

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;