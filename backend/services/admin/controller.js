const User = require('../auth/models/User');
const { getRedisClient, getPostgresPool } = require('../../database/connections');
const { asyncHandler } = require('../../middleware/error');
const moment = require('moment-timezone');

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isVerified } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { phoneNumber: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } }
    ];
  }
  if (isVerified !== undefined) {
    query.isVerified = isVerified === 'true';
  }

  const users = await User.find(query)
    .select('-refreshTokens')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('-refreshTokens');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' }
    });
  }

  try {
    const pool = getPostgresPool();
    const statsResult = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );
    
    const stats = statsResult.rows[0] || {
      horoscope_views: 0,
      profile_updates: 0,
      last_active: null
    };

    res.json({
      success: true,
      data: { user, stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.json({
      success: true,
      data: { user, stats: null }
    });
  }
});

const createHoroscope = asyncHandler(async (req, res) => {
  const {
    date,
    sunSign,
    summary,
    theme,
    notificationText,
    sections,
    dosAndDonts,
    lucky,
    moodRatings,
    affirmation,
    chartSnippet,
    comparison,
    explanation,
    published = false
  } = req.body;

  if (!date || !sunSign || !sections) {
    return res.status(400).json({
      success: false,
      error: { message: 'Date, sun sign, and sections are required' }
    });
  }

  const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  if (!validSigns.includes(sunSign)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid zodiac sign' }
    });
  }

  try {
    const pool = getPostgresPool();
    
    const query = `
      INSERT INTO horoscopes (
        date, sun_sign, summary, theme, notification_text, sections,
        dos_and_donts, lucky, mood_ratings, affirmation, chart_snippet,
        comparison, explanation, generation_metadata, published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (sun_sign, date) 
      DO UPDATE SET
        summary = $3, theme = $4, notification_text = $5, sections = $6,
        dos_and_donts = $7, lucky = $8, mood_ratings = $9, affirmation = $10,
        chart_snippet = $11, comparison = $12, explanation = $13,
        generation_metadata = $14, published = $15, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const generationMetadata = {
      engine: 'admin-manual-entry',
      templateVersion: 'v1.0',
      confidenceScore: 1.0,
      generatedAt: new Date().toISOString(),
      createdBy: req.user.userId
    };

    const values = [
      date,
      sunSign,
      summary,
      theme,
      notificationText,
      JSON.stringify(sections),
      JSON.stringify(dosAndDonts),
      JSON.stringify(lucky),
      JSON.stringify(moodRatings),
      affirmation,
      JSON.stringify(chartSnippet),
      JSON.stringify(comparison),
      explanation,
      JSON.stringify(generationMetadata),
      published
    ];

    const result = await pool.query(query, values);
    const horoscope = result.rows[0];

    const redis = getRedisClient();
    const cacheKey = `horoscope:${sunSign}:${date}`;
    await redis.setEx(cacheKey, 86400, JSON.stringify(horoscope));

    res.json({
      success: true,
      message: 'Horoscope created/updated successfully',
      data: { horoscope }
    });
  } catch (error) {
    console.error('Create horoscope error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create horoscope' }
    });
  }
});

const getHoroscopes = asyncHandler(async (req, res) => {
  const { date, sunSign, page = 1, limit = 20 } = req.query;
  
  try {
    const pool = getPostgresPool();
    let query = 'SELECT * FROM horoscopes';
    let countQuery = 'SELECT COUNT(*) FROM horoscopes';
    const values = [];
    const conditions = [];

    if (date) {
      conditions.push(`date = $${values.length + 1}`);
      values.push(date);
    }

    if (sunSign) {
      conditions.push(`sun_sign = $${values.length + 1}`);
      values.push(sunSign);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // If filtering by specific date, prioritize zodiac order, otherwise order by date
    if (date) {
      query += ' ORDER BY sun_sign ASC, date DESC';
    } else {
      query += ' ORDER BY date DESC, sun_sign ASC';
    }
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    
    const totalResult = await pool.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count);
    
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: {
        horoscopes: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get horoscopes error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch horoscopes' }
    });
  }
});

const deleteHoroscope = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = getPostgresPool();
    
    const selectResult = await pool.query(
      'SELECT sun_sign, date FROM horoscopes WHERE id = $1',
      [id]
    );
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Horoscope not found' }
      });
    }

    const { sun_sign, date } = selectResult.rows[0];
    
    await pool.query('DELETE FROM horoscopes WHERE id = $1', [id]);

    const redis = getRedisClient();
    const cacheKey = `horoscope:${sun_sign}:${date}`;
    await redis.del(cacheKey);

    res.json({
      success: true,
      message: 'Horoscope deleted successfully'
    });
  } catch (error) {
    console.error('Delete horoscope error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete horoscope' }
    });
  }
});

const clearCache = asyncHandler(async (req, res) => {
  const { date, sunSign } = req.body;
  
  try {
    const redis = getRedisClient();
    
    if (date && sunSign) {
      const cacheKey = `horoscope:${sunSign}:${date}`;
      await redis.del(cacheKey);
      res.json({
        success: true,
        message: `Cache cleared for ${sunSign} on ${date}`
      });
    } else if (date) {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const keys = signs.map(sign => `horoscope:${sign}:${date}`);
      await redis.del(keys);
      res.json({
        success: true,
        message: `Cache cleared for all signs on ${date}`
      });
    } else {
      await redis.flushall();
      res.json({
        success: true,
        message: 'All cache cleared'
      });
    }
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to clear cache' }
    });
  }
});

const publishHoroscope = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body;
  
  try {
    const pool = getPostgresPool();
    
    const result = await pool.query(
      'UPDATE horoscopes SET published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [published, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Horoscope not found' }
      });
    }

    const horoscope = result.rows[0];
    
    // Update cache if published
    if (published) {
      const redis = getRedisClient();
      const cacheKey = `horoscope:${horoscope.sun_sign}:${horoscope.date}`;
      await redis.setEx(cacheKey, 86400, JSON.stringify(horoscope));
    }

    res.json({
      success: true,
      message: published ? 'Horoscope published successfully' : 'Horoscope unpublished successfully',
      data: { horoscope }
    });
  } catch (error) {
    console.error('Publish horoscope error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update horoscope status' }
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  createHoroscope,
  getHoroscopes,
  deleteHoroscope,
  publishHoroscope,
  clearCache
};