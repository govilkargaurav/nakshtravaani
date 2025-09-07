const { generateTokenPair } = require('../../utils/jwt');
const { asyncHandler } = require('../../middleware/error');

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Username and password are required' }
    });
  }

  if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials' }
    });
  }

  const adminUser = {
    _id: 'admin',
    username: ADMIN_CREDENTIALS.username,
    isAdmin: true,
    role: 'admin'
  };

  const tokens = generateTokenPair(adminUser);

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      admin: adminUser,
      tokens
    }
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const { getPostgresPool } = require('../../database/connections');
  const User = require('../auth/models/User');

  try {
    const pool = getPostgresPool();
    
    // Get total users
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalVerifiedUsers = await User.countDocuments({ isActive: true, isVerified: true });
    
    // Get today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayRegistrations = await User.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get daily active users (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const dailyActiveUsers = await User.countDocuments({
      lastActive: { $gte: last24Hours }
    });

    // Get horoscope views today
    const horoscopeViewsResult = await pool.query(
      `SELECT SUM(horoscope_views) as total_views FROM user_stats 
       WHERE DATE(last_active) = CURRENT_DATE`
    );
    
    const todayHoroscopeViews = horoscopeViewsResult.rows[0]?.total_views || 0;

    // Get recent users
    const recentUsers = await User.find({ isActive: true })
      .select('phoneNumber profile createdAt lastActive isVerified')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get horoscope count by date
    const horoscopeStatsResult = await pool.query(`
      SELECT date, COUNT(*) as count 
      FROM horoscopes 
      WHERE date >= (CURRENT_DATE - INTERVAL '7 days')::text
      GROUP BY date 
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVerifiedUsers,
          todayRegistrations,
          dailyActiveUsers,
          todayHoroscopeViews
        },
        recentUsers,
        horoscopeStats: horoscopeStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard stats' }
    });
  }
});

module.exports = {
  adminLogin,
  getDashboardStats
};