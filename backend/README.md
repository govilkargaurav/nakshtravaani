# Nakshatravani Astrology Backend API

A comprehensive backend service for the Nakshatravani Astrology application with user authentication, profile management, and horoscope services.

## Features

- 📱 **Mobile OTP Authentication** - Register/Login with phone number and OTP verification
- 👤 **User Profile Management** - Birth details, preferences, and birth chart information
- 🌟 **Daily Horoscope Service** - Zodiac-based horoscope delivery with caching
- 🔐 **Admin Panel** - User management and horoscope content management
- 🗄️ **Hybrid Database** - MongoDB for user data, PostgreSQL for transactional data
- ⚡ **Redis Caching** - High-performance caching for horoscope data
- 🔒 **JWT Authentication** - Secure token-based authentication with refresh tokens

## Tech Stack

- **Runtime**: Node.js + Express
- **Databases**: 
  - MongoDB (User profiles, authentication)
  - PostgreSQL (Horoscopes, transactions, analytics)
  - Redis (Caching, sessions)
- **Authentication**: JWT with refresh tokens
- **OTP Provider**: Pluggable (MSG91, Dummy for development)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **API will be available at**: `http://localhost:3000`

### Manual Setup

1. **Prerequisites**:
   - Node.js 16+
   - MongoDB
   - PostgreSQL
   - Redis

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update .env with your database URLs and secrets
   ```

4. **Start the server**:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and login/register
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### User Profile
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/user/birth-chart` - Update birth chart information

### Horoscope
- `GET /api/v1/horoscope/daily` - Get user's daily horoscope
- `GET /api/v1/horoscope/all?date=2025-09-06` - Get all zodiac signs for a date
- `GET /api/v1/horoscope/:sign?date=2025-09-06` - Get specific sign's horoscope

### Admin (Requires admin privileges)
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/:userId` - Get user details with stats
- `POST /api/v1/admin/horoscopes` - Create/update horoscope
- `GET /api/v1/admin/horoscopes` - List horoscopes
- `DELETE /api/v1/admin/horoscopes/:id` - Delete horoscope
- `POST /api/v1/admin/cache/clear` - Clear cache

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Databases
MONGODB_URI=mongodb://localhost:27017/astrology
POSTGRES_URI=postgresql://postgres:password@localhost:5432/astrology
REDIS_URI=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OTP
OTP_EXPIRES_IN=300000
DUMMY_OTP=123456
SMS_PROVIDER=dummy
MSG91_API_KEY=your-msg91-key
```

## Database Schema

### MongoDB Collections
- **users**: User profiles, authentication, preferences, birth chart data

### PostgreSQL Tables
- **horoscopes**: Daily horoscope content for all zodiac signs
- **user_stats**: User activity analytics
- **transactions**: Payment and subscription data

## Development

### Running Tests
```bash
npm test          # Run all tests
npm run test:watch # Watch mode
```

### Code Quality
```bash
npm run lint      # ESLint check
npm run lint:fix  # Fix linting issues
npm run format    # Prettier formatting
```

### Database Management
The application automatically creates required tables on startup. For fresh setup:

1. **MongoDB**: Collections created automatically
2. **PostgreSQL**: Tables created via migrations on startup
3. **Redis**: Used for caching, no schema required

## Production Deployment

1. **Set environment variables** for production databases
2. **Enable SSL/TLS** for database connections
3. **Configure SMS provider** (MSG91 or similar)
4. **Set strong JWT secrets**
5. **Configure reverse proxy** (nginx recommended)
6. **Enable rate limiting** and security headers

## API Authentication Flow

1. **Registration/Login**:
   - Send OTP to phone number
   - Verify OTP → Get access + refresh tokens
   - Auto-register if phone number not exists

2. **Authenticated Requests**:
   - Include `Authorization: Bearer <access_token>` header
   - Refresh token when access token expires

3. **Admin Access**:
   - User must have `isAdmin: true` in database
   - All admin endpoints require admin privileges

## Horoscope Content Management

Horoscopes are managed through admin APIs and follow this schema:

```json
{
  "date": "2025-09-06",
  "sunSign": "Aries",
  "summary": "Today brings clarity...",
  "sections": {
    "career": {"title": "Career & Work", "text": "..."},
    "love": {"title": "Love & Relationships", "text": "..."},
    "finance": {"title": "Money & Finance", "text": "..."},
    "health": {"title": "Health & Wellness", "text": "..."},
    "personal_growth": {"title": "Personal Growth", "text": "..."}
  },
  "lucky": {
    "numbers": ["3", "7"],
    "colors": ["Deep Blue"],
    "time_of_day": "10:00-12:00 local"
  }
}
```

## Support

For issues and feature requests, please check the project documentation or contact the development team.

---

**Built with ❤️ for Nakshatravaani**