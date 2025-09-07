const express = require('express');
const { protect, adminOnly } = require('../../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createHoroscope,
  getHoroscopes,
  deleteHoroscope,
  publishHoroscope,
  clearCache
} = require('./controller');
const { adminLogin, getDashboardStats } = require('./adminAuth');

const router = express.Router();

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);

// Horoscope management
router.post('/horoscopes', createHoroscope);
router.get('/horoscopes', getHoroscopes);
router.patch('/horoscopes/:id/publish', publishHoroscope);
router.delete('/horoscopes/:id', deleteHoroscope);

// Cache management
router.post('/cache/clear', clearCache);

module.exports = router;