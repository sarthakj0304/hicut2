import { useState, useEffect } from 'react';
import { apiClient, User } from '@/services/api';
import { useAuth } from './useAuth';

export function useTokens() {
  const { user, refreshProfile } = useAuth();
  const [tokens, setTokens] = useState<User['tokens'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tokens from user data
  useEffect(() => {
    if (user?.tokens) {
      setTokens(user.tokens);
    }
  }, [user]);

  // Fetch token balance
  const fetchTokenBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTokenBalance();
      
      if (response.success && response.data) {
        setTokens(response.data.tokens);
        return response.data.tokens;
      } else {
        setError(response.message || 'Failed to fetch token balance');
        return null;
      }
    } catch (error) {
      console.error('Fetch token balance error:', error);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer tokens between categories
  const transferTokens = async (fromCategory: string, toCategory: string, amount: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.transferTokens(fromCategory, toCategory, amount);
      
      if (response.success && response.data) {
        setTokens(response.data.tokens);
        await refreshProfile(); // Update user profile with new token balance
        return { success: true, tokens: response.data.tokens };
      } else {
        setError(response.message || 'Failed to transfer tokens');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Transfer tokens error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get token transaction history
  const fetchTokenHistory = async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTokenHistory(page, limit);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch token history');
        return null;
      }
    } catch (error) {
      console.error('Fetch token history error:', error);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total tokens
  const totalTokens = tokens ? 
    tokens.food + tokens.travel + tokens.clothing + tokens.coupons : 0;

  // Get tokens by category
  const getTokensByCategory = (category: keyof User['tokens']) => {
    return tokens?.[category] || 0;
  };

  // Check if user has enough tokens for a purchase
  const hasEnoughTokens = (category: keyof User['tokens'], amount: number) => {
    return getTokensByCategory(category) >= amount;
  };

  return {
    tokens,
    totalTokens,
    isLoading,
    error,
    fetchTokenBalance,
    transferTokens,
    fetchTokenHistory,
    getTokensByCategory,
    hasEnoughTokens,
    clearError: () => setError(null),
  };
}