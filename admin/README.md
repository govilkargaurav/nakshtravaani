# Nakshatravani Astrology Admin Panel

A comprehensive React.js admin panel for managing the Nakshatravani Astrology platform with authentication, analytics dashboard, user management, and horoscope content management.

## Features

### 🔐 **Authentication**
- Simple username/password login
- JWT token-based authentication
- Automatic session management
- Protected routes

### 📊 **Analytics Dashboard** 
- **User Metrics**: Total users, verified users, daily registrations, active users
- **Engagement Stats**: Daily horoscope views, user activity trends
- **Visual Charts**: 7-day horoscope views trend with Recharts
- **Recent Activity**: Latest user registrations and activity

### 👥 **User Management**
- **User List**: Paginated table with search and filtering
- **User Details**: Complete profile information, birth chart details, subscription status
- **Usage Statistics**: Horoscope views, profile updates per user
- **Search & Filter**: By phone number, name, verification status

### 🔮 **Horoscope Management**
- **Create Daily Horoscopes**: Full horoscope editor for all zodiac signs
- **Rich Content Editor**: 
  - Summary, theme, notification text
  - 5 sections (Career, Love, Finance, Health, Personal Growth)
  - Dos and don'ts lists
  - Lucky numbers, colors, time of day
  - Mood ratings (Energy, Love, Work, Luck) with sliders
  - Affirmations and astrological explanations
- **Content Management**: View, edit, delete existing horoscopes
- **Cache Management**: Clear cache for instant content updates
- **Publishing**: Instant publish to all users

## Tech Stack

- **Frontend**: React 18, Ant Design 5.x
- **Routing**: React Router v6
- **Charts**: Recharts for analytics visualization
- **HTTP Client**: Axios with interceptors
- **Styling**: Ant Design + Custom CSS
- **State Management**: React Hooks + Local Storage

## Getting Started

### Prerequisites
- Node.js 16+
- Backend API running on http://localhost:3000

### Installation

1. **Install dependencies**:
   ```bash
   cd admin
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Access admin panel**: `http://localhost:3001`

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
admin/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.js          # Main layout with sidebar
│   │   └── ProtectedRoute.js  # Route protection
│   ├── pages/
│   │   ├── Login.js           # Authentication
│   │   ├── Dashboard.js       # Analytics dashboard
│   │   ├── Users.js          # User management
│   │   └── Horoscopes.js     # Horoscope management
│   ├── services/
│   │   └── api.js            # API calls with interceptors
│   ├── utils/
│   │   └── auth.js           # Authentication utilities
│   ├── App.js                # Main app with routing
│   ├── index.js              # App entry point
│   └── index.css             # Global styles
└── package.json
```

## Key Features Detail

### Dashboard Analytics
- **Real-time Metrics**: User count, registrations, active users
- **Trend Analysis**: 7-day horoscope view trends
- **Quick Insights**: Recent user activity, verification rates
- **Visual Charts**: Interactive line charts for data visualization

### Horoscope Editor
- **Complete Content Management**: All horoscope fields per schema
- **User-Friendly Interface**: 
  - Character counters for length limits
  - Slider inputs for mood ratings
  - Multi-select for colors and elements
  - Textarea inputs with validation
- **Preview & Validation**: Form validation before publishing
- **Instant Publishing**: Direct to cache and database

### User Management
- **Advanced Search**: Phone number, name-based search
- **Detailed Profiles**: Complete user information view
- **Activity Tracking**: Login patterns, horoscope consumption
- **Subscription Management**: View user subscription details

## Environment Configuration

Create `.env` file in admin directory:

```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

## API Integration

The admin panel integrates with these backend endpoints:

### Authentication
- `POST /api/v1/admin/login` - Admin login

### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

### User Management
- `GET /api/v1/admin/users` - List users with pagination/search
- `GET /api/v1/admin/users/:id` - Get user details with stats

### Horoscope Management
- `GET /api/v1/admin/horoscopes` - List horoscopes
- `POST /api/v1/admin/horoscopes` - Create/update horoscope
- `DELETE /api/v1/admin/horoscopes/:id` - Delete horoscope
- `POST /api/v1/admin/cache/clear` - Clear cache

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Route Protection**: All admin routes protected
- **Auto Logout**: Automatic logout on token expiry
- **Session Management**: Persistent login with localStorage
- **API Interceptors**: Automatic token attachment and error handling

## Responsive Design

- **Mobile Friendly**: Responsive design for tablets and mobile
- **Ant Design**: Professional UI components
- **Grid Layout**: Responsive grid system for all screen sizes
- **Touch Friendly**: Mobile-optimized interactions

## Development

### Available Scripts

- `npm start` - Development server (port 3001)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-specific page components  
- **Services**: API integration layer
- **Utils**: Utility functions and helpers
- **Hooks**: Custom React hooks (if needed)

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **Traditional Hosting**: Apache, Nginx
3. **Container**: Docker deployment
4. **CDN**: CloudFront, CloudFlare

### Environment Variables

Set production API URL:
```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

## Usage Guide

### Creating Daily Horoscopes

1. **Navigate to Horoscopes** section
2. **Click "Create New Horoscope"**
3. **Fill all required fields**:
   - Date and zodiac sign
   - Summary and theme
   - All 5 content sections
   - Lucky elements and mood ratings
4. **Preview and Publish**
5. **Cache automatically updated**

### Managing Users

1. **View all users** in paginated table
2. **Search by phone/name**
3. **Filter by verification status**
4. **Click "View Details"** for complete user profile
5. **Monitor user activity** and engagement

### Dashboard Monitoring

1. **Check daily metrics** on dashboard
2. **Monitor user growth** trends
3. **Track horoscope engagement**
4. **Review recent activity**

## Troubleshooting

### Common Issues

1. **Login Issues**: Check backend API connectivity
2. **Cache Problems**: Use "Clear Cache" button
3. **Form Validation**: Check required fields and character limits
4. **API Errors**: Check browser console and network tab

### Support

For technical issues:
1. Check browser console for errors
2. Verify API endpoint connectivity  
3. Ensure proper authentication tokens
4. Review network requests in dev tools

---

**Built with ❤️ for Nakshatravaani Admin Team**