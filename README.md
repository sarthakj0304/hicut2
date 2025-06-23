# HICUT 🚗

> **Community-Driven Reward-Token Hitchhiking App**

A revolutionary ride-sharing platform that connects **Riders (Hitchers)** and **Drivers (Pilots)** for short- and medium-distance lifts using a token-based reward system instead of cash payments.

---

## 📱 App Overview

HICUT enables community members to share rides for distances ranging from 500m to 200km. Every completed ride earns both participants **reward tokens** that can be redeemed for:
- 🍕 **Food & Beverages** (Starbucks, local restaurants)
- ✈️ **Travel Gear** (Airbnb credits, travel accessories)
- 👕 **Clothing** (Nike, Adidas discounts)
- 🎟️ **Exclusive Coupons** (Local businesses, entertainment)

---

## 🛠️ Tech Stack

### Frontend (Current)
- **Framework**: React Native with Expo Router 4.0.17
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based routing)
- **Animations**: React Native Reanimated 3.x
- **Icons**: Lucide React Native
- **Fonts**: Inter (via @expo-google-fonts)
- **State Management**: React Context API
- **Platform**: Web-first (iOS/Android compatible)

### Backend (Planned)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Real-time**: WebSockets (Socket.io)
- **Maps**: Google Maps API / Mapbox
- **File Storage**: AWS S3 / Cloudinary
- **Payment Processing**: Stripe (for token purchases)
- **Push Notifications**: Firebase Cloud Messaging

### DevOps & Deployment
- **Hosting**: Vercel (Frontend) + Railway/Heroku (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Mixpanel / Google Analytics

---

## 📂 Current Directory Structure

```
HICUT/
├── 📁 app/                          # Expo Router routes
│   ├── 📄 _layout.tsx              # Root layout with fonts & providers
│   ├── 📄 onboarding.tsx           # Role selection & app intro
│   ├── 📄 +not-found.tsx           # 404 error page
│   └── 📁 (tabs)/                  # Main tab navigation
│       ├── 📄 _layout.tsx          # Tab bar configuration
│       ├── 📄 index.tsx            # 🗺️ Map view (main screen)
│       ├── 📄 rides.tsx            # 🚗 Ride history & management
│       ├── 📄 rewards.tsx          # 🏆 Token wallet & redemption
│       └── 📄 profile.tsx          # 👤 User profile & settings
│
├── 📁 components/                   # Reusable UI components
│   ├── 📄 BottomAlert.tsx          # Toast notifications
│   ├── 📄 EditProfileModal.tsx     # Profile editing modal
│   ├── 📄 RadarNotification.tsx    # Driver ride request alerts
│   ├── 📄 RewardRedemptionModal.tsx # Token redemption interface
│   ├── 📄 RideStatusCard.tsx       # Live ride status display
│   ├── 📄 RoleContext.tsx          # Rider/Driver role management
│   ├── 📄 RoleToggle.tsx           # Role switching component
│   ├── 📄 SettingsModal.tsx        # App settings interface
│   └── 📄 TokenProgressCard.tsx    # Tier progression display
│
├── 📁 hooks/                       # Custom React hooks
│   └── 📄 useFrameworkReady.ts     # Framework initialization
│
├── 📁 types/                       # TypeScript definitions
│   └── 📄 env.d.ts                 # Environment variables
│
├── 📄 package.json                 # Dependencies & scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 app.json                    # Expo configuration
└── 📄 README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hicut-app.git
   cd hicut-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser or mobile**
   - Web: `http://localhost:8081`
   - Mobile: Scan QR code with Expo Go app

---

## 🎯 Current Features (MVP)

### ✅ Completed
- [x] **Onboarding Flow** - Role selection (Rider/Driver)
- [x] **Role Management** - Dynamic UI based on user role
- [x] **Map Interface** - Interactive ride discovery
- [x] **Ride Matching** - Driver-rider connection simulation
- [x] **Token System** - Reward calculation & display
- [x] **Rewards Wallet** - Token categories & redemption UI
- [x] **Profile Management** - User stats & achievements
- [x] **Ride History** - Past trips tracking
- [x] **Responsive Design** - Mobile-first UI/UX
- [x] **Animations** - Smooth micro-interactions

### 🔄 In Progress
- [ ] **Real Map Integration** - Google Maps/Mapbox
- [ ] **Location Services** - GPS tracking & geofencing
- [ ] **Push Notifications** - Ride alerts & updates

---

## 🗺️ Development Roadmap

### Phase 1: Backend Foundation (Weeks 1-3)
#### 🔐 Authentication System
- [ ] **User Registration/Login**
  - Email/password authentication
  - Phone number verification (OTP)
  - Social login (Google, Apple)
  - JWT token management
  - Password reset functionality

- [ ] **Document Verification**
  - Driver's license upload & validation
  - Government ID verification
  - Vehicle registration (for drivers)
  - Insurance document verification
  - Background check integration
  - Manual review workflow

#### 🗄️ Database Schema
```javascript
// User Model
{
  _id: ObjectId,
  email: String,
  phone: String,
  role: ['rider', 'driver', 'both'],
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    dateOfBirth: Date,
    gender: String
  },
  verification: {
    email: Boolean,
    phone: Boolean,
    identity: Boolean,
    driverLicense: Boolean,
    backgroundCheck: Boolean
  },
  location: {
    current: { lat: Number, lng: Number },
    address: String,
    city: String,
    state: String
  },
  tokens: {
    food: Number,
    travel: Number,
    clothing: Number,
    coupons: Number,
    total: Number
  },
  stats: {
    totalRides: Number,
    rating: Number,
    trustScore: Number,
    carbonSaved: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Ride Model
{
  _id: ObjectId,
  driver: ObjectId,
  rider: ObjectId,
  status: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
  pickup: {
    location: { lat: Number, lng: Number },
    address: String,
    timestamp: Date
  },
  destination: {
    location: { lat: Number, lng: Number },
    address: String,
    estimatedArrival: Date
  },
  route: {
    distance: Number,
    duration: Number,
    polyline: String
  },
  tokens: {
    amount: Number,
    category: String
  },
  timestamps: {
    requested: Date,
    accepted: Date,
    started: Date,
    completed: Date
  },
  rating: {
    driverRating: Number,
    riderRating: Number,
    feedback: String
  }
}

// Vehicle Model (for drivers)
{
  _id: ObjectId,
  owner: ObjectId,
  make: String,
  model: String,
  year: Number,
  color: String,
  licensePlate: String,
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    verified: Boolean
  },
  documents: [{
    type: String,
    url: String,
    verified: Boolean
  }]
}
```

#### 🛣️ API Endpoints
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-phone
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PUT  /api/auth/me

// Document Verification
POST /api/verification/upload-document
GET  /api/verification/status
PUT  /api/verification/approve/:documentId
PUT  /api/verification/reject/:documentId

// Rides
POST /api/rides/create
GET  /api/rides/nearby
POST /api/rides/join/:rideId
PUT  /api/rides/:rideId/status
GET  /api/rides/history
POST /api/rides/:rideId/rate

// Tokens & Rewards
GET  /api/tokens/balance
POST /api/tokens/redeem
GET  /api/rewards/available
GET  /api/rewards/history

// Real-time (WebSocket)
WS   /api/socket/ride-updates
WS   /api/socket/location-tracking
```

### Phase 2: Core Features (Weeks 4-6)
#### 🗺️ Map Integration
- [ ] **Google Maps/Mapbox Setup**
  - Interactive map component
  - Real-time location tracking
  - Route calculation & optimization
  - Geofencing for pickup/dropoff
  - Traffic-aware routing

- [ ] **Location Services**
  - GPS permission handling
  - Background location tracking
  - Location accuracy validation
  - Offline map caching
  - Address geocoding/reverse geocoding

#### 🚗 Ride Management
- [ ] **Ride Creation & Discovery**
  - Create ride requests
  - Find nearby drivers/riders
  - Real-time availability updates
  - Smart matching algorithm
  - Distance-based filtering (2km radius)

- [ ] **Live Ride Tracking**
  - Real-time driver location
  - ETA calculations
  - Route progress tracking
  - Arrival notifications
  - Emergency features

### Phase 3: Advanced Features (Weeks 7-9)
#### 🏆 Token Economy
- [ ] **Dynamic Token System**
  - Distance-based token calculation
  - Surge pricing during peak hours
  - Bonus tokens for ratings
  - Referral rewards
  - Achievement unlocks

- [ ] **Reward Partnerships**
  - Brand integration API
  - Voucher generation system
  - Redemption tracking
  - Inventory management
  - Partner dashboard

#### 🔔 Communication & Notifications
- [ ] **Push Notifications**
  - Ride request alerts
  - Driver arrival notifications
  - Token earning updates
  - Promotional offers
  - Safety alerts

- [ ] **In-App Messaging**
  - Driver-rider chat
  - Automated status updates
  - Emergency contact system
  - Message encryption
  - Chat history

### Phase 4: Safety & Trust (Weeks 10-12)
#### 🛡️ Safety Features
- [ ] **Trust & Safety System**
  - User rating system
  - Report & block functionality
  - Emergency SOS button
  - Live ride sharing with contacts
  - Incident reporting

- [ ] **Anti-Fraud Measures**
  - Ride completion verification
  - GPS-based validation
  - Duplicate ride prevention
  - Token manipulation detection
  - Suspicious activity monitoring

#### 📊 Analytics & Monitoring
- [ ] **User Analytics**
  - Ride completion rates
  - User engagement metrics
  - Token redemption patterns
  - Geographic usage data
  - Performance monitoring

### Phase 5: Scaling & Optimization (Weeks 13-16)
#### ⚡ Performance Optimization
- [ ] **App Performance**
  - Code splitting & lazy loading
  - Image optimization
  - Caching strategies
  - Bundle size optimization
  - Memory leak prevention

- [ ] **Backend Scaling**
  - Database indexing
  - API rate limiting
  - Load balancing
  - Caching layers (Redis)
  - CDN integration

#### 🌍 Multi-Region Support
- [ ] **Localization**
  - Multi-language support
  - Currency localization
  - Regional token partnerships
  - Local regulation compliance
  - Cultural adaptation

---

## 👥 Team Structure & Responsibilities

### Frontend Team
- **Lead Developer**: React Native/Expo expertise
- **UI/UX Developer**: Design system implementation
- **Mobile Developer**: Platform-specific optimizations

### Backend Team
- **API Developer**: RESTful API & WebSocket implementation
- **Database Engineer**: MongoDB schema & optimization
- **DevOps Engineer**: Deployment & infrastructure

### Product Team
- **Product Manager**: Feature prioritization & roadmap
- **QA Engineer**: Testing & quality assurance
- **Business Development**: Partnership & token economy

---

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### Testing Strategy
- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: Detox for E2E testing
- **API Tests**: Supertest for backend
- **Performance Tests**: Flipper integration

### Security Measures
- **Data Encryption**: AES-256 for sensitive data
- **API Security**: Rate limiting, CORS, helmet
- **Authentication**: JWT with refresh tokens
- **Input Validation**: Joi/Yup schemas
- **HTTPS**: SSL/TLS encryption

---

## 🚀 Deployment Strategy

### Development Environment
- **Frontend**: Expo Development Build
- **Backend**: Local Node.js server
- **Database**: MongoDB Atlas (free tier)
- **Testing**: Expo Go app

### Staging Environment
- **Frontend**: Vercel preview deployments
- **Backend**: Railway/Heroku staging
- **Database**: MongoDB Atlas (shared cluster)
- **Domain**: staging.hicut.app

### Production Environment
- **Frontend**: Vercel production
- **Backend**: AWS/Railway production
- **Database**: MongoDB Atlas (dedicated cluster)
- **CDN**: Cloudflare
- **Monitoring**: Sentry + DataDog
- **Domain**: hicut.app

---

## 📈 Success Metrics

### User Engagement
- Daily/Monthly Active Users
- Ride completion rate (target: >90%)
- User retention (Day 1, 7, 30)
- Session duration
- Feature adoption rates

### Business Metrics
- Token redemption rate
- Partner conversion rate
- Revenue per user
- Customer acquisition cost
- Lifetime value

### Technical Metrics
- App crash rate (<1%)
- API response time (<200ms)
- App store ratings (>4.5)
- Load time (<3s)
- Uptime (>99.9%)

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Workflow
- **Branching**: GitFlow model
- **Code Review**: Required for all PRs
- **Testing**: All tests must pass
- **Documentation**: Update relevant docs

---

## 📞 Contact & Support

### Development Team
- **Slack**: #hicut-dev
- **Email**: dev@hicut.app
- **GitHub**: [HICUT Organization](https://github.com/hicut-app)

### Project Management
- **Jira**: Feature tracking & sprints
- **Confluence**: Documentation & specs
- **Figma**: Design system & prototypes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For continuous innovation
- **Open Source Contributors**: For the libraries we depend on

---

*Let's revolutionize community transportation together! 🚗💨*

---

**Version**: 1.0.0-alpha  
**Last Updated**: December 2024  
**Next Milestone**: Backend API Development