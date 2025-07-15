import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { apiClient, User } from '@/services/api';
import { TokenStorage, UserStorage } from '@/services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  rememberedEmail: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  setRememberMe: (remember: boolean) => void;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const isAuthenticated = !!user;

  // Check for existing session on app start
  useEffect(() => {
    checkAuthStatus();
    loadRememberedCredentials();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await TokenStorage.getAccessToken();
      if (token) {
        const response = await apiClient.getProfile();
        if (response.success && response.data) {
          setUser(response.data.user);
          await UserStorage.setUserData(response.data.user);
        } else {
          await TokenStorage.clearTokens();
          await UserStorage.clearAllData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await TokenStorage.clearTokens();
      await UserStorage.clearAllData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadRememberedCredentials = async () => {
    try {
      const credentials = await UserStorage.getLoginCredentials();
      if (credentials) {
        setRememberedEmail(credentials.email);
      }
    } catch (error) {
      console.error('Error loading remembered credentials:', error);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        await TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        await UserStorage.setUserData(user);

        // Store login credentials if remember me is enabled
        if (rememberMe) {
          await UserStorage.setLoginCredentials(email, true);
        }

        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        await TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        await UserStorage.setUserData(user);
        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await TokenStorage.clearTokens();
      await UserStorage.clearAllData();
      setRememberedEmail(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(updates);

      if (response.success && response.data) {
        setUser(response.data.user);
        await UserStorage.setUserData(response.data.user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Update failed',
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
        await UserStorage.setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        rememberedEmail,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        setRememberMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
