# hicut2

├── app/                    # All routes
│   ├── _layout.tsx        # Root layout with fonts & RoleProvider
│   ├── onboarding.tsx     # Onboarding screen
│   ├── +not-found.tsx     # 404 screen
│   └── (tabs)/            # Tab navigation group
│       ├── _layout.tsx    # Tab layout configuration
│       ├── index.tsx      # Map screen (main tab)
│       ├── rides.tsx      # Rides history
│       ├── rewards.tsx    # Rewards & tokens
│       └── profile.tsx    # User profile
├── components/            # Reusable components
│   ├── BottomAlert.tsx
│   ├── EditProfileModal.tsx
│   ├── RadarNotification.tsx
│   ├── RewardRedemptionModal.tsx
│   ├── RideStatusCard.tsx
│   ├── RoleContext.tsx
│   ├── RoleToggle.tsx
│   ├── SettingsModal.tsx
│   └── TokenProgressCard.tsx
└── hooks/                 # Custom hooks
    └── useFrameworkReady.ts
    
Key Changes Made
🔧 Root Layout (app/_layout.tsx)
Added font loading with Inter font family
Integrated useFrameworkReady hook (required for framework)
Wrapped app with RoleProvider for role management
Configured navigation stack with onboarding → tabs flow
🎯 Import Path Updates
All components now use the correct import paths:

@/components/RoleContext for context
@/components/RoleToggle for role switching
@/hooks/useFrameworkReady for the framework hook
📱 Navigation Flow
Onboarding → Role selection → Tab navigation
Tab Navigation with 4 main screens:
Map (index) - Main ride interface
Rides - Trip history
Rewards - Token wallet & redemption
Profile - User settings & stats
🎨 Features 
Role switching between rider/driver modes
Animated UI components with react-native-reanimated
Token-based reward system
Community-driven ride sharing
Beautiful gradient designs and micro-interactions
