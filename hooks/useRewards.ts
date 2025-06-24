import { useState, useEffect } from 'react';
import { apiClient, Reward } from '@/services/api';
import { useAuth } from './useAuth';

export function useRewards() {
  const { refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available rewards
  const fetchRewards = async (category?: string, featured?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getAvailableRewards(category, featured);
      
      if (response.success && response.data) {
        setRewards(response.data.rewards);
        return response.data.rewards;
      } else {
        setError(response.message || 'Failed to fetch rewards');
        return [];
      }
    } catch (error) {
      console.error('Fetch rewards error:', error);
      setError('Network error. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reward categories with token counts
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getRewardCategories();
      
      if (response.success && response.data) {
        setCategories(response.data.categories);
        return response.data.categories;
      } else {
        setError(response.message || 'Failed to fetch categories');
        return [];
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      setError('Network error. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get specific reward details
  const fetchRewardDetails = async (rewardId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getRewardDetails(rewardId);
      
      if (response.success && response.data) {
        return response.data.reward;
      } else {
        setError(response.message || 'Failed to fetch reward details');
        return null;
      }
    } catch (error) {
      console.error('Fetch reward details error:', error);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Redeem a reward
  const redeemReward = async (rewardId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.redeemReward(rewardId);
      
      if (response.success && response.data) {
        await refreshProfile(); // Update user profile with new token balance
        return { 
          success: true, 
          redemption: response.data.redemption,
          userTokens: response.data.userTokens 
        };
      } else {
        setError(response.message || 'Failed to redeem reward');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Redeem reward error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get redemption history
  const fetchRedemptionHistory = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getRedemptionHistory(page, limit);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch redemption history');
        return null;
      }
    } catch (error) {
      console.error('Fetch redemption history error:', error);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter rewards by category
  const getRewardsByCategory = (category: string) => {
    return rewards.filter(reward => reward.category === category);
  };

  // Get featured rewards
  const getFeaturedRewards = () => {
    return rewards.filter(reward => reward.featured);
  };

  return {
    rewards,
    categories,
    isLoading,
    error,
    fetchRewards,
    fetchCategories,
    fetchRewardDetails,
    redeemReward,
    fetchRedemptionHistory,
    getRewardsByCategory,
    getFeaturedRewards,
    clearError: () => setError(null),
  };
}