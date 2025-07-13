import { Platform } from 'react-native';

// Enhanced storage service for user data
export class UserStorage {
  private static USER_DATA_KEY = 'hicut_user_data';
  private static LOGIN_CREDENTIALS_KEY = 'hicut_login_credentials';
  private static PREFERENCES_KEY = 'hicut_user_preferences';

  // Store complete user data
  static async setUserData(userData: any) {
    const dataToStore = JSON.stringify(userData);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(this.USER_DATA_KEY, dataToStore);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.USER_DATA_KEY, dataToStore);
    }
  }

  // Get stored user data
  static async getUserData() {
    try {
      let userData;
      
      if (Platform.OS === 'web') {
        userData = localStorage.getItem(this.USER_DATA_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      }
      
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Store login credentials (for remember me functionality)
  static async setLoginCredentials(email: string, rememberMe: boolean = false) {
    if (!rememberMe) return;
    
    const credentials = JSON.stringify({ email, timestamp: Date.now() });
    
    if (Platform.OS === 'web') {
      localStorage.setItem(this.LOGIN_CREDENTIALS_KEY, credentials);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.LOGIN_CREDENTIALS_KEY, credentials);
    }
  }

  // Get stored login credentials
  static async getLoginCredentials() {
    try {
      let credentials;
      
      if (Platform.OS === 'web') {
        credentials = localStorage.getItem(this.LOGIN_CREDENTIALS_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        credentials = await AsyncStorage.getItem(this.LOGIN_CREDENTIALS_KEY);
      }
      
      if (credentials) {
        const parsed = JSON.parse(credentials);
        // Check if credentials are not older than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (parsed.timestamp > thirtyDaysAgo) {
          return parsed;
        } else {
          // Remove expired credentials
          await this.clearLoginCredentials();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving login credentials:', error);
      return null;
    }
  }

  // Store user preferences
  static async setUserPreferences(preferences: any) {
    const dataToStore = JSON.stringify(preferences);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(this.PREFERENCES_KEY, dataToStore);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.PREFERENCES_KEY, dataToStore);
    }
  }

  // Get user preferences
  static async getUserPreferences() {
    try {
      let preferences;
      
      if (Platform.OS === 'web') {
        preferences = localStorage.getItem(this.PREFERENCES_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        preferences = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      }
      
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return null;
    }
  }

  // Clear all stored data
  static async clearAllData() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(this.USER_DATA_KEY);
      localStorage.removeItem(this.LOGIN_CREDENTIALS_KEY);
      localStorage.removeItem(this.PREFERENCES_KEY);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiRemove([
        this.USER_DATA_KEY,
        this.LOGIN_CREDENTIALS_KEY,
        this.PREFERENCES_KEY
      ]);
    }
  }

  // Clear only login credentials
  static async clearLoginCredentials() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(this.LOGIN_CREDENTIALS_KEY);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(this.LOGIN_CREDENTIALS_KEY);
    }
  }
}

// Enhanced Token Storage with better error handling
export class TokenStorage {
  private static ACCESS_TOKEN_KEY = 'hicut_access_token';
  private static REFRESH_TOKEN_KEY = 'hicut_refresh_token';
  private static TOKEN_EXPIRY_KEY = 'hicut_token_expiry';

  static async setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
    try {
      const expiryTime = expiresIn ? Date.now() + (expiresIn * 1000) : Date.now() + (24 * 60 * 60 * 1000); // Default 24 hours
      
      if (Platform.OS === 'web') {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.multiSet([
          [this.ACCESS_TOKEN_KEY, accessToken],
          [this.REFRESH_TOKEN_KEY, refreshToken],
          [this.TOKEN_EXPIRY_KEY, expiryTime.toString()]
        ]);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      let token, expiry;
      
      if (Platform.OS === 'web') {
        token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const values = await AsyncStorage.multiGet([this.ACCESS_TOKEN_KEY, this.TOKEN_EXPIRY_KEY]);
        token = values[0][1];
        expiry = values[1][1];
      }
      
      // Check if token is expired
      if (token && expiry && Date.now() > parseInt(expiry)) {
        await this.clearTokens();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  static async clearTokens() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.multiRemove([
          this.ACCESS_TOKEN_KEY,
          this.REFRESH_TOKEN_KEY,
          this.TOKEN_EXPIRY_KEY
        ]);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  static async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }
}