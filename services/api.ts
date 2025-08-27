// API service for HICUT frontend
import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';

// Types
export interface User {
  _id: string;
  email: string;
  phone: string;
  role: 'rider' | 'driver' | 'both';
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    dateOfBirth: string;
    gender: string;
    bio?: string;
  };
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    driverLicense: boolean;
    backgroundCheck: boolean;
  };
  location: {
    current: {
      lat: number;
      lng: number;
      timestamp: string;
    };
    address: string;
    city: string;
    state: string;
  };
  tokens: {
    food: number;
    travel: number;
    clothing: number;
    coupons: number;
    total: number;
  };
  stats: {
    totalRides: number;
    completedRides: number;
    rating: number;
    ratingCount: number;
    trustScore: number;
    carbonSaved: number;
  };
}

export interface Ride {
  _id: string;
  driver: User;
  rider?: User;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  pickup: {
    location: {
      coordinates: [number, number]; // [lng, lat]
    };
    address: string;
    landmark?: string;
  };
  destination: {
    location: {
      coordinates: [number, number]; // [lng, lat]
    };
    address: string;
    landmark?: string;
  };
  route: {
    distance: number;
    duration: number;
    polyline?: string;
  };
  tokens: {
    amount: number;
    category: 'food' | 'travel' | 'clothing' | 'coupons';
    distributed: boolean;
  };
  scheduledTime: string;
  timestamps: {
    requested: string;
    accepted?: string;
    started?: string;
    completed?: string;
    cancelled?: string;
  };
  rating: {
    driverRating?: number;
    riderRating?: number;
    driverFeedback?: string;
    riderFeedback?: string;
  };
  notes?: string;
  maxPassengers: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'travel' | 'clothing' | 'coupons';
  cost: number;
  originalPrice?: string;
  discount?: string;
  brand: string;
  image: string;
  available: boolean;
  featured?: boolean;
  terms?: string[];
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Storage for tokens
class TokenStorage {
  private static ACCESS_TOKEN_KEY = 'hicut_access_token';
  private static REFRESH_TOKEN_KEY = 'hicut_refresh_token';

  static async setTokens(accessToken: string, refreshToken: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      // Use AsyncStorage for mobile
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } else {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } else {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static async clearTokens() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } else {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(this.ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }
}

// HTTP Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Add auth header if token exists
    const token = await TokenStorage.getAccessToken();
    let baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Safely merge headers if present
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        baseHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers) {
        baseHeaders[key] = value;
      }
    } else if (
      typeof options.headers === 'object' &&
      options.headers !== null
    ) {
      baseHeaders = {
        ...baseHeaders,
        ...(options.headers as Record<string, string>),
      };
    }

    if (token) {
      baseHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: baseHeaders,
      });

      const data = await response.json();

      // Handle token refresh
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = await TokenStorage.getAccessToken();
          baseHeaders.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers: baseHeaders,
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await TokenStorage.setTokens(data.data.accessToken, refreshToken);
        return true;
      }

      // Refresh failed, clear tokens
      await TokenStorage.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await TokenStorage.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = await TokenStorage.getRefreshToken();
    const result = await this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    await TokenStorage.clearTokens();
    return result;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile');
  }

  async updateProfile(
    updates: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/updateProfile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async sendPhoneOTP(phone: string): Promise<ApiResponse<void>> {
    return this.request('/auth/send-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhoneOTP(otp: string): Promise<ApiResponse<void>> {
    return this.request('/auth/verify-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  // User endpoints
  async updateLocation(
    lat: number,
    lng: number,
    address?: string
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users/location', {
      method: 'PUT',
      body: JSON.stringify({ lat, lng, address }),
    });
  }

  async getNearbyUsers(
    lat: number,
    lng: number,
    radius?: number,
    role?: string
  ): Promise<ApiResponse<{ users: User[] }>> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() }),
      ...(role && { role }),
    });
    return this.request(`/users/nearby?${params}`);
  }

  async updateRole(
    role: 'rider' | 'driver' | 'both'
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users/role', {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getUserStats(): Promise<
    ApiResponse<{ stats: User['stats']; tokens: User['tokens'] }>
  > {
    return this.request('/users/stats');
  }

  // Ride endpoints
  async createRide(rideData: {
    pickup: {
      location: { coordinates: [number, number] };
      address: string;
      landmark?: string;
    };
    destination: {
      location: { coordinates: [number, number] };
      address: string;
      landmark?: string;
    };
    scheduledTime?: string;
    maxPassengers?: number;
    notes?: string;
  }): Promise<ApiResponse<{ ride: Ride }>> {
    return this.request('/rides/create', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async getNearbyRides(
    lat: number,
    lng: number,
    radius?: number
  ): Promise<ApiResponse<{ rides: Ride[] }>> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() }),
    });
    return this.request(`/rides/nearby?${params}`);
  }

  async joinRide(rideId: string): Promise<ApiResponse<{ ride: Ride }>> {
    return this.request(`/rides/${rideId}/join`, {
      method: 'POST',
    });
  }

  async updateRideStatus(
    rideId: string,
    status: string
  ): Promise<ApiResponse<{ ride: Ride }>> {
    return this.request(`/rides/${rideId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getRideHistory(
    page?: number,
    limit?: number,
    status?: string
  ): Promise<
    ApiResponse<{
      rides: Ride[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>
  > {
    const params = new URLSearchParams({
      ...(page && { page: page.toString() }),
      ...(limit && { limit: limit.toString() }),
      ...(status && { status }),
    });
    return this.request(`/rides/history?${params}`);
  }

  async rateRide(
    rideId: string,
    rating: number,
    feedback?: string
  ): Promise<ApiResponse<{ ride: Ride }>> {
    return this.request(`/rides/${rideId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  // Token endpoints
  async getTokenBalance(): Promise<ApiResponse<{ tokens: User['tokens'] }>> {
    return this.request('/tokens/balance');
  }

  async transferTokens(
    fromCategory: string,
    toCategory: string,
    amount: number
  ): Promise<ApiResponse<{ tokens: User['tokens'] }>> {
    return this.request('/tokens/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromCategory, toCategory, amount }),
    });
  }

  async getTokenHistory(
    page?: number,
    limit?: number
  ): Promise<
    ApiResponse<{
      transactions: any[];
      pagination: any;
    }>
  > {
    const params = new URLSearchParams({
      ...(page && { page: page.toString() }),
      ...(limit && { limit: limit.toString() }),
    });
    return this.request(`/tokens/history?${params}`);
  }

  // Reward endpoints
  async getAvailableRewards(
    category?: string,
    featured?: boolean
  ): Promise<ApiResponse<{ rewards: Reward[] }>> {
    const params = new URLSearchParams({
      ...(category && { category }),
      ...(featured !== undefined && { featured: featured.toString() }),
    });
    return this.request(`/rewards/available?${params}`);
  }

  async getRewardDetails(
    rewardId: string
  ): Promise<ApiResponse<{ reward: Reward }>> {
    return this.request(`/rewards/${rewardId}`);
  }

  async redeemReward(rewardId: string): Promise<
    ApiResponse<{
      redemption: any;
      userTokens: User['tokens'];
    }>
  > {
    return this.request(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
    });
  }

  async getRedemptionHistory(
    page?: number,
    limit?: number
  ): Promise<
    ApiResponse<{
      redemptions: any[];
      pagination: any;
    }>
  > {
    const params = new URLSearchParams({
      ...(page && { page: page.toString() }),
      ...(limit && { limit: limit.toString() }),
    });
    return this.request(`/rewards/user/history?${params}`);
  }

  async getRewardCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.request('/rewards/categories/summary');
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// WebSocket service
export class WebSocketService {
  private socket: any = null;
  private token: string | null = null;

  async connect() {
    if (Platform.OS === 'web') {
      // Use socket.io-client for web
      const io = require('socket.io-client');
      this.token = await TokenStorage.getAccessToken();

      this.socket = io(WS_BASE_URL, {
        auth: {
          token: this.token,
        },
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Location updates
  updateLocation(lat: number, lng: number, address?: string) {
    if (this.socket) {
      this.socket.emit('location_update', { lat, lng, address });
    }
  }

  // Ride events
  sendRideRequest(driverId: string, rideDetails: any) {
    if (this.socket) {
      this.socket.emit('ride_request', { driverId, rideDetails });
    }
  }

  acceptRide(riderId: string, rideId: string) {
    if (this.socket) {
      this.socket.emit('ride_accept', { riderId, rideId });
    }
  }

  rejectRide(riderId: string, rideId: string, reason?: string) {
    if (this.socket) {
      this.socket.emit('ride_reject', { riderId, rideId, reason });
    }
  }

  updateRideStatus(rideId: string, status: string, targetUserId: string) {
    if (this.socket) {
      this.socket.emit('ride_status_update', { rideId, status, targetUserId });
    }
  }

  // Chat
  sendMessage(rideId: string, message: string, recipientId: string) {
    if (this.socket) {
      this.socket.emit('send_message', { rideId, message, recipientId });
    }
  }

  // Emergency
  sendEmergencyAlert(
    rideId: string,
    location: { lat: number; lng: number },
    type: string
  ) {
    if (this.socket) {
      this.socket.emit('emergency_alert', { rideId, location, type });
    }
  }

  // Driver availability
  toggleAvailability(available: boolean) {
    if (this.socket) {
      this.socket.emit('toggle_availability', { available });
    }
  }

  // Event listeners
  onRideRequest(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_ride_request', callback);
    }
  }

  onRideAccepted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ride_accepted', callback);
    }
  }

  onRideRejected(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ride_rejected', callback);
    }
  }

  onRideStatusChanged(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ride_status_changed', callback);
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onEmergencyAlert(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('emergency_alert', callback);
    }
  }

  onLocationUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_location_update', callback);
    }
  }

  // Remove listeners
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create WebSocket service instance
export const wsService = new WebSocketService();

// Export token storage for use in other parts of the app
export { TokenStorage };
