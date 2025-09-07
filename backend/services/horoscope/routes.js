const express = require('express');
const { protect } = require('../../middleware/auth');
const { getDailyHoroscope, getHoroscopeBySign } = require('./controller');

const router = express.Router();

// Get user's daily horoscope (based on their sun sign and today's date)
router.get('/daily', protect, getDailyHoroscope);

// Get all zodiac signs' horoscopes for a specific date
// Usage: /horoscope/all?date=2025-09-06 (if no date, returns today's horoscopes)
router.get('/all', getHoroscopeBySign);

// Get horoscope by specific zodiac sign and optional date
// Usage: /horoscope/Aries?date=2025-09-06 (if no date, returns today's horoscope)
router.get('/:sign', getHoroscopeBySign);

module.exports = router;