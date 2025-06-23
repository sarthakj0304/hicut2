declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // API Configuration
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      
      // Map Services
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string;
      EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: string;
      
      // Authentication
      EXPO_PUBLIC_JWT_SECRET: string;
      EXPO_PUBLIC_REFRESH_TOKEN_SECRET: string;
      
      // Database
      EXPO_PUBLIC_MONGODB_URI: string;
      
      // File Storage
      EXPO_PUBLIC_AWS_ACCESS_KEY_ID: string;
      EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: string;
      EXPO_PUBLIC_AWS_S3_BUCKET: string;
      EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      EXPO_PUBLIC_CLOUDINARY_API_KEY: string;
      EXPO_PUBLIC_CLOUDINARY_API_SECRET: string;
      
      // Push Notifications
      EXPO_PUBLIC_FCM_SERVER_KEY: string;
      EXPO_PUBLIC_EXPO_PUSH_TOKEN: string;
      
      // Payment Processing
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      EXPO_PUBLIC_STRIPE_SECRET_KEY: string;
      
      // Third-party Services
      EXPO_PUBLIC_SENTRY_DSN: string;
      EXPO_PUBLIC_MIXPANEL_TOKEN: string;
      
      // Document Verification
      EXPO_PUBLIC_ONFIDO_API_TOKEN: string;
      EXPO_PUBLIC_JUMIO_API_TOKEN: string;
      
      // SMS/Phone Verification
      EXPO_PUBLIC_TWILIO_ACCOUNT_SID: string;
      EXPO_PUBLIC_TWILIO_AUTH_TOKEN: string;
      EXPO_PUBLIC_TWILIO_PHONE_NUMBER: string;
      
      // Email Services
      EXPO_PUBLIC_SENDGRID_API_KEY: string;
      EXPO_PUBLIC_MAILGUN_API_KEY: string;
      
      // Environment
      NODE_ENV: 'development' | 'staging' | 'production';
      EXPO_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';
    }
  }
}

// Ensure this file is treated as a module
export {};