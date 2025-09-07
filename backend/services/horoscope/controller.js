const User = require('../auth/models/User');
const { getRedisClient, getPostgresPool } = require('../../database/connections');
const { asyncHandler } = require('../../middleware/error');
const moment = require('moment-timezone');

const getDailyHoroscope = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  
  if (!user || !user.profile?.dateOfBirth) {
    return res.status(400).json({
      success: false,
      error: { message: 'User birth date not found. Please update your profile.' }
    });
  }

  if (!user.birthChart?.sunSign) {
    return res.status(400).json({
      success: false,
      error: { message: 'Sun sign not calculated. Please update your birth details.' }
    });
  }

  const today = moment().tz(user.preferences?.timezone || 'Asia/Kolkata').format('YYYY-MM-DD');
  const sunSign = user.birthChart.sunSign;

  try {
    const redis = getRedisClient();
    const cacheKey = `horoscope:${sunSign}:${today}`;
    
    let horoscope = await redis.get(cacheKey);
    
    if (!horoscope) {
      const pool = getPostgresPool();
      const result = await pool.query(
        'SELECT * FROM horoscopes WHERE sun_sign = $1 AND date = $2 AND published = true',
        [sunSign, today]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: `Horoscope not available for ${sunSign} on ${today}` }
        });
      }
      
      horoscope = result.rows[0];
      await redis.setEx(cacheKey, 86400, JSON.stringify(horoscope));
    } else {
      horoscope = JSON.parse(horoscope);
    }

    try {
      const pool = getPostgresPool();
      await pool.query(
        `INSERT INTO user_stats (user_id, horoscope_views, last_active) 
         VALUES ($1, 1, $2) 
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           horoscope_views = user_stats.horoscope_views + 1,
           last_active = $2,
           updated_at = CURRENT_TIMESTAMP`,
        [user._id.toString(), new Date()]
      );
    } catch (pgError) {
      console.error('PostgreSQL horoscope stats error:', pgError);
    }

    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      data: { horoscope }
    });
  } catch (error) {
    console.error('Get horoscope error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch horoscope' }
    });
  }
});

const getHoroscopeBySign = asyncHandler(async (req, res) => {
  const { sign } = req.params;
  const { date } = req.query;
  
  const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const targetDate = date || moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

  try {
    // If sign is 'all', return horoscopes for all zodiac signs
    if (sign === 'all') {
      const redis = getRedisClient();
      const pool = getPostgresPool();
      const allHoroscopes = {};
      const missingFromCache = [];

      // Check cache for all signs
      for (const zodiacSign of validSigns) {
        const cacheKey = `horoscope:${zodiacSign}:${targetDate}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) {
          allHoroscopes[zodiacSign] = JSON.parse(cached);
        } else {
          missingFromCache.push(zodiacSign);
        }
      }

      // Fetch missing horoscopes from database
      if (missingFromCache.length > 0) {
        const result = await pool.query(
          'SELECT * FROM horoscopes WHERE sun_sign = ANY($1) AND date = $2 AND published = true',
          [missingFromCache, targetDate]
        );

        for (const horoscope of result.rows) {
          allHoroscopes[horoscope.sun_sign] = horoscope;
          const cacheKey = `horoscope:${horoscope.sun_sign}:${targetDate}`;
          await redis.setEx(cacheKey, 86400, JSON.stringify(horoscope));
        }
      }

      // Check which signs are missing
      const availableSigns = Object.keys(allHoroscopes);
      const missingSigns = validSigns.filter(s => !availableSigns.includes(s));

      return res.json({
        success: true,
        data: { 
          horoscopes: allHoroscopes,
          date: targetDate,
          availableSigns,
          missingSigns: missingSigns.length > 0 ? missingSigns : undefined
        }
      });
    }

    // Handle single sign request
    if (!validSigns.includes(sign)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid zodiac sign' }
      });
    }

    const redis = getRedisClient();
    const cacheKey = `horoscope:${sign}:${targetDate}`;
    
    let horoscope = await redis.get(cacheKey);
    
    if (!horoscope) {
      const pool = getPostgresPool();
      const result = await pool.query(
        'SELECT * FROM horoscopes WHERE sun_sign = $1 AND date = $2 AND published = true',
        [sign, targetDate]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: `Horoscope not available for ${sign} on ${targetDate}` }
        });
      }
      
      horoscope = result.rows[0];
      await redis.setEx(cacheKey, 86400, JSON.stringify(horoscope));
    } else {
      horoscope = JSON.parse(horoscope);
    }

    res.json({
      success: true,
      data: { horoscope }
    });
  } catch (error) {
    console.error('Get horoscope by sign error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch horoscope' }
    });
  }
});

module.exports = {
  getDailyHoroscope,
  getHoroscopeBySign
};