const User = require('../auth/models/User');
const { getPostgresPool } = require('../../database/connections');
const { asyncHandler } = require('../../middleware/error');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-refreshTokens');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    timeOfBirth,
    placeOfBirth,
    coordinates,
    gender,
    avatar,
    preferences
  } = req.body;

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  if (firstName !== undefined) user.profile.firstName = firstName;
  if (lastName !== undefined) user.profile.lastName = lastName;
  if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
  if (timeOfBirth !== undefined) user.profile.timeOfBirth = timeOfBirth;
  if (placeOfBirth !== undefined) user.profile.placeOfBirth = placeOfBirth;
  if (coordinates !== undefined) user.profile.coordinates = coordinates;
  if (gender !== undefined) user.profile.gender = gender;
  if (avatar !== undefined) user.profile.avatar = avatar;
  
  if (preferences) {
    if (preferences.timezone) user.preferences.timezone = preferences.timezone;
    if (preferences.language) user.preferences.language = preferences.language;
    if (preferences.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...preferences.notifications
      };
    }
  }

  await user.save();

  try {
    const pool = getPostgresPool();
    await pool.query(
      `INSERT INTO user_stats (user_id, profile_updates, last_active) 
       VALUES ($1, 1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         profile_updates = user_stats.profile_updates + 1,
         last_active = $2,
         updated_at = CURRENT_TIMESTAMP`,
      [user._id.toString(), new Date()]
    );
  } catch (pgError) {
    console.error('PostgreSQL user stats error:', pgError);
  }

  const updatedUser = await User.findById(req.user.userId).select('-refreshTokens');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

const updateBirthChart = asyncHandler(async (req, res) => {
  const {
    dateOfBirth,
    timeOfBirth,
    placeOfBirth,
    coordinates
  } = req.body;

  if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
    return res.status(400).json({
      success: false,
      error: { message: 'Date of birth, time of birth, and place of birth are required' }
    });
  }

  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  const previousDate = user.profile.dateOfBirth;
  const previousTime = user.profile.timeOfBirth;

  user.profile.dateOfBirth = new Date(dateOfBirth);
  user.profile.timeOfBirth = timeOfBirth;
  user.profile.placeOfBirth = placeOfBirth;
  
  if (coordinates) {
    user.profile.coordinates = coordinates;
  }

  const dateChanged = !previousDate || previousDate.getTime() !== user.profile.dateOfBirth.getTime();
  const timeChanged = previousTime !== timeOfBirth;

  if (dateChanged || timeChanged) {
    user.birthChart.recalculationQueued = true;
    user.birthChart.sunSign = calculateSunSign(user.profile.dateOfBirth);
  }

  await user.save();

  const updatedUser = await User.findById(req.user.userId).select('-refreshTokens');

  res.json({
    success: true,
    message: 'Birth chart information updated successfully',
    data: { 
      user: updatedUser,
      recalculationQueued: user.birthChart.recalculationQueued
    }
  });
});

const calculateSunSign = (dateOfBirth) => {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const signs = [
    { sign: 'Capricorn', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
    { sign: 'Aquarius', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
    { sign: 'Pisces', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
    { sign: 'Aries', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
    { sign: 'Taurus', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
    { sign: 'Gemini', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
    { sign: 'Cancer', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
    { sign: 'Leo', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
    { sign: 'Virgo', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
    { sign: 'Libra', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
    { sign: 'Scorpio', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
    { sign: 'Sagittarius', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  ];

  for (const { sign, start, end } of signs) {
    if (sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign;
      }
    } else {
      if (
        (month === start.month && day >= start.day) ||
        (month === end.month && day <= end.day)
      ) {
        return sign;
      }
    }
  }

  return 'Unknown';
};

module.exports = {
  getProfile,
  updateProfile,
  updateBirthChart
};