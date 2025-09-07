require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectMongoDB, connectPostgres, connectRedis } = require('./database/connections');
const { errorHandler } = require('./middleware/error');
const { notFound } = require('./middleware/notFound');

const authRoutes = require('./services/auth/routes');
const userRoutes = require('./services/user/routes');
const horoscopeRoutes = require('./services/horoscope/routes');
const adminRoutes = require('./services/admin/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Nakshatravani Astrology Backend API',
    version: API_VERSION,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/user`, userRoutes);
app.use(`/api/${API_VERSION}/horoscope`, horoscopeRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectMongoDB();
    await connectPostgres();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`🚀 Nakshatravani Astrology Server running on port ${PORT}`);
      console.log(`🌟 API available at http://localhost:${PORT}/api/${API_VERSION}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;