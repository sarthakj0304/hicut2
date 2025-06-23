# HICUT Backend API

## Overview
This is the backend API for HICUT, a community-driven ride-sharing platform with token-based rewards.

## Features
- JWT-based authentication
- Real-time communication with Socket.io
- Token-based reward system
- Ride matching and management
- Document verification workflow
- Push notifications
- Email and SMS services

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **SMS**: Twilio

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account
- Twilio account (for SMS)
- Email service (Gmail/SendGrid)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/send-phone-otp` - Send phone verification OTP
- `POST /api/auth/verify-phone-otp` - Verify phone OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby` - Get nearby users
- `PUT /api/users/role` - Update user role
- `GET /api/users/stats` - Get user statistics

### Rides
- `POST /api/rides/create` - Create ride (drivers only)
- `GET /api/rides/nearby` - Get nearby rides (riders)
- `POST /api/rides/:id/join` - Join a ride (riders)
- `PUT /api/rides/:id/status` - Update ride status
- `GET /api/rides/history` - Get ride history
- `POST /api/rides/:id/rate` - Rate a completed ride

### Tokens
- `GET /api/tokens/balance` - Get token balance
- `POST /api/tokens/add` - Add tokens (admin)
- `POST /api/tokens/transfer` - Transfer tokens between categories
- `GET /api/tokens/history` - Get token transaction history

### Rewards
- `GET /api/rewards/available` - Get available rewards
- `GET /api/rewards/:id` - Get reward details
- `POST /api/rewards/:id/redeem` - Redeem a reward
- `GET /api/rewards/user/history` - Get redemption history
- `GET /api/rewards/categories/summary` - Get categories summary

## WebSocket Events

### Client to Server
- `location_update` - Update user location
- `ride_request` - Send ride request to driver
- `ride_accept` - Accept a ride request
- `ride_reject` - Reject a ride request
- `ride_status_update` - Update ride status
- `send_message` - Send chat message
- `emergency_alert` - Send emergency alert
- `toggle_availability` - Toggle driver availability

### Server to Client
- `user_location_update` - User location updated
- `new_ride_request` - New ride request received
- `ride_accepted` - Ride request accepted
- `ride_rejected` - Ride request rejected
- `ride_status_changed` - Ride status changed
- `new_message` - New chat message
- `emergency_alert` - Emergency alert
- `driver_availability_changed` - Driver availability changed

## Database Models

### User
- Basic information (email, phone, password)
- Profile details (name, avatar, bio)
- Role management (rider/driver/both)
- Verification status
- Location data
- Token wallet
- Statistics and ratings

### Ride
- Driver and rider references
- Pickup and destination locations
- Route information
- Token rewards
- Status tracking
- Ratings and feedback

### Vehicle (for drivers)
- Vehicle details
- Insurance and registration
- Document verification
- Photos and features

## Security Features
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Error Handling
- Centralized error handling middleware
- Validation error formatting
- Proper HTTP status codes
- Development vs production error responses

## Testing
```bash
npm test
```

## Deployment
The backend can be deployed to:
- Railway
- Heroku
- AWS
- DigitalOcean

## Environment Variables
See `.env.example` for all required environment variables.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License
MIT License