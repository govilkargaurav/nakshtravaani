const mongoose = require('mongoose');
const { Pool } = require('pg');
const { createClient } = require('redis');

let postgresPool;
let redisClient;

async function connectMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function connectPostgres() {
  try {
    const postgresUri = process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/astrology';
    postgresPool = new Pool({
      connectionString: postgresUri,
    });
    
    await postgresPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
    
    await initializePostgresTables();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

async function connectRedis() {
  try {
    const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUri });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis client error:', err);
    });
    
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
}

async function initializePostgresTables() {
  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      reference_id VARCHAR(255),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  const createUserStatsTable = `
    CREATE TABLE IF NOT EXISTS user_stats (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) UNIQUE NOT NULL,
      horoscope_views INTEGER DEFAULT 0,
      profile_updates INTEGER DEFAULT 0,
      last_active TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  const createHoroscopesTable = `
    CREATE TABLE IF NOT EXISTS horoscopes (
      id SERIAL PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      locale VARCHAR(10) DEFAULT 'en-IN',
      sun_sign VARCHAR(20) NOT NULL,
      summary TEXT,
      theme VARCHAR(50),
      notification_text VARCHAR(80),
      sections JSONB NOT NULL,
      dos_and_donts JSONB,
      lucky JSONB,
      mood_ratings JSONB,
      affirmation TEXT,
      chart_snippet JSONB,
      comparison JSONB,
      explanation TEXT,
      generation_metadata JSONB,
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sun_sign, date)
    );
  `;
  
  const addPublishedColumnIfMissing = `
    ALTER TABLE horoscopes ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
  `;
  
  await postgresPool.query(createTransactionsTable);
  await postgresPool.query(createUserStatsTable);
  await postgresPool.query(createHoroscopesTable);
  await postgresPool.query(addPublishedColumnIfMissing);
  console.log('✅ PostgreSQL tables initialized');
}

function getPostgresPool() {
  if (!postgresPool) {
    throw new Error('PostgreSQL connection not initialized');
  }
  return postgresPool;
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis connection not initialized');
  }
  return redisClient;
}

module.exports = {
  connectMongoDB,
  connectPostgres,
  connectRedis,
  getPostgresPool,
  getRedisClient,
};