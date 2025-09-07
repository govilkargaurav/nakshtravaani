const express = require('express');
const { protect } = require('../../middleware/auth');
const { getProfile, updateProfile, updateBirthChart } = require('./controller');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/birth-chart', updateBirthChart);

module.exports = router;