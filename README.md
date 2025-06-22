
# HICUT

> Community‑Driven Reward‑Token Hitchhiking App

---

## 📘 Project Overview
HICUT connects **Riders (Hitchers)** and **Drivers (Pilots)** for short- and medium-distance lifts (500 m–200 km). Instead of cash, every unique completed ride earns both participants **reward tokens** (Food, Travel‑Gear, Clothing, Coupons) redeemable with partner brands. Launching in India, built with React Native (Expo Router) and Node.js/Express + MongoDB.

---

## 🛠️ Tech Stack
- **Frontend:** React Native (Expo Router), TypeScript
- **Backend:** Node.js + Express, MongoDB (Mongoose)
- **Auth:** JWT (bcrypt)
- **Maps & Geolocation:** Google Maps API or Mapbox
- **Real‑time:** WebSockets or polling
- **Other:** React Native Reanimated, Context API, AsyncStorage

---

## 📂 Directory Structure
```
app/                    # All screens & routes
├── _layout.tsx         # Root layout & RoleProvider
├── onboarding.tsx      # Onboarding & role select
└── (tabs)/             # Main tab navigator
    ├── _layout.tsx     # Tab layout
    ├── index.tsx       # Map view
    ├── rides.tsx       # Ride history
    ├── rewards.tsx     # Rewards wallet
    └── profile.tsx     # User profile

components/             # Reusable UI components
├── BottomAlert.tsx      # Toast notifications
├── EditProfileModal.tsx 
├── RadarNotification.tsx
├── RewardRedemptionModal.tsx
├── RideStatusCard.tsx  
├── RoleContext.tsx     # Role state provider
├── RoleToggle.tsx      # Rider/Pilot toggle
├── SettingsModal.tsx   
└── TokenProgressCard.tsx

hooks/                  # Custom React hooks
└── useFrameworkReady.tsx

backend/                # Backend (separate repo)
├── controllers/        # auth, ride, reward logic
├── models/             # Mongoose schemas
├── routes/             # Express routes
├── middleware/         # JWT verification, validation
└── server.js           # Entry point
```

---

## 👥 Team Roles & Tasks

| Developer | Responsibilities                                                                            |
|-----------|---------------------------------------------------------------------------------------------|
| **Dev #1**<br>Auth & Profile     | • Complete `authController`, `authRoutes`, `auth` middleware<br>• Extend User model (avatar, bio, trustScore)<br>• Implement `PUT /api/auth/me` for profile updates     |
| **Dev #2**<br>Ride Management    | • Build `rideController`, `rideRoutes` & Ride model<br>• Endpoints: `/rides/create`, `/rides/join`, `/rides/nearby`<br>• Geolocation logic (2 km radius, Haversine formula)<br>• Anti‑cheating checks        |
| **Dev #3**<br>Rewards & Admin    | • Build `rewardController`, `rewardRoutes`, Reward model<br>• Endpoints: `/rewards/status`, `/rewards/redeem`<br>• Token economics logic (10 tokens/ride, bonuses)<br>• Dummy brand pool implementation      |

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
git clone https://github.com/yourusername/hicut-frontend.git
cd hicut-frontend
   ```

2. **Install dependencies**
   ```bash
npm install
   ```

3. **Configure environment**
   - Create a `.env` in `backend/`:
     ```ini
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/hicut
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the app**
   - **Backend**:
     ```bash
cd backend
npm run dev
     ```
   - **Frontend**:
     ```bash
npm run dev
     ```

5. **API Testing**
   - Use Postman or Thunder Client to test endpoints under `localhost:5000/api/...`

---

## 📋 Workflow & Contribution
- **Branching:** Use `feature/<name>` branches off `dev`.
- **Commits:** Write clear messages, reference issues.
- **PRs:** Assign at least one reviewer, link to issue.
- **Daily sync:** 15‑minute stand-ups to share blockers.

---

## 📞 Contact
- Slack: #hicut-dev
- 

---

*Let’s build HICUT together!*
