import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Star, Gift, Coins, ChevronRight, Coffee, Shirt, Plane, Tag, TrendingUp, Trophy, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface TokenBalance {
  category: 'food' | 'travel' | 'clothing' | 'coupons';
  balance: number;
  icon: React.ReactNode;
  color: string;
  gradient: string[];
}

interface Reward {
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
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  completed: boolean;
  icon: React.ReactNode;
}

const tokenBalances: TokenBalance[] = [
  {
    category: 'food',
    balance: 245,
    icon: <Coffee size={24} color="#FFFFFF" strokeWidth={2} />,
    color: '#FF6B35',
    gradient: ['#FF6B35', '#FF8E53']
  },
  {
    category: 'travel',
    balance: 180,
    icon: <Plane size={24} color="#FFFFFF" strokeWidth={2} />,
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D']
  },
  {
    category: 'clothing',
    balance: 95,
    icon: <Shirt size={24} color="#FFFFFF" strokeWidth={2} />,
    color: '#A8E6CF',
    gradient: ['#A8E6CF', '#88D8A3']
  },
  {
    category: 'coupons',
    balance: 320,
    icon: <Tag size={24} color="#FFFFFF" strokeWidth={2} />,
    color: '#FFD93D',
    gradient: ['#FFD93D', '#6BCF7F']
  }
];

const featuredRewards: Reward[] = [
  {
    id: '1',
    title: 'Starbucks Coffee',
    description: 'Grande size any drink',
    category: 'food',
    cost: 50,
    originalPrice: '$5.95',
    brand: 'Starbucks',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: true
  },
  {
    id: '2',
    title: 'Nike Air Max',
    description: '25% off any sneaker',
    category: 'clothing',
    cost: 150,
    discount: '25% OFF',
    brand: 'Nike',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: true
  },
  {
    id: '3',
    title: 'Airbnb Credit',
    description: '$25 travel credit',
    category: 'travel',
    cost: 200,
    originalPrice: '$25.00',
    brand: 'Airbnb',
    image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: false,
    featured: true
  }
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Ride',
    description: 'Complete your first ride',
    progress: 1,
    total: 1,
    reward: 25,
    completed: true,
    icon: <Star size={20} color="#FFD700" strokeWidth={2} />
  },
  {
    id: '2',
    title: 'Community Helper',
    description: 'Complete 10 rides',
    progress: 7,
    total: 10,
    reward: 100,
    completed: false,
    icon: <Trophy size={20} color="#007AFF" strokeWidth={2} />
  },
  {
    id: '3',
    title: 'Token Collector',
    description: 'Earn 500 total tokens',
    progress: 340,
    total: 500,
    reward: 50,
    completed: false,
    icon: <Coins size={20} color="#34C759" strokeWidth={2} />
  }
];

export default function RewardsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAchievements, setShowAchievements] = useState(false);
  
  const totalTokens = tokenBalances.reduce((sum, token) => sum + token.balance, 0);
  const nextTierTokens = 1000;
  const progress = totalTokens / nextTierTokens;
  
  const slideAnimation = useSharedValue(0);
  const achievementScale = useSharedValue(1);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    slideAnimation.value = withSpring(category === 'all' ? 0 : 1);
  };

  const handleAchievementToggle = () => {
    setShowAchievements(!showAchievements);
    achievementScale.value = withSpring(showAchievements ? 1 : 0.95);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <Coffee size={16} color="#FF6B35" strokeWidth={2} />;
      case 'travel': return <Plane size={16} color="#4ECDC4" strokeWidth={2} />;
      case 'clothing': return <Shirt size={16} color="#A8E6CF" strokeWidth={2} />;
      case 'coupons': return <Tag size={16} color="#FFD93D" strokeWidth={2} />;
      default: return <Award size={16} color="#007AFF" strokeWidth={2} />;
    }
  };

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideAnimation.value, [0, 1], [0, -20]) }],
    opacity: interpolate(slideAnimation.value, [0, 1], [1, 0.7])
  }));

  const achievementStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievementScale.value }]
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Rewards Wallet</Text>
          <Text style={styles.subtitle}>Redeem your earned tokens</Text>
        </View>
        <TouchableOpacity 
          style={styles.achievementButton}
          onPress={handleAchievementToggle}
          activeOpacity={0.8}
        >
          <TrendingUp size={20} color="#007AFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Balance Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>{totalTokens}</Text>
              <Text style={styles.balanceSubtext}>tokens</Text>
            </View>
            <View style={styles.balanceIcon}>
              <Zap size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progress to Platinum</Text>
              <Text style={styles.progressTokens}>{nextTierTokens - totalTokens} tokens to go</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Token Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Categories</Text>
          <View style={styles.tokenGrid}>
            {tokenBalances.map((token) => (
              <LinearGradient
                key={token.category}
                colors={token.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tokenCard}
              >
                <View style={styles.tokenIcon}>
                  {token.icon}
                </View>
                <Text style={styles.tokenBalance}>{token.balance}</Text>
                <Text style={styles.tokenCategory}>
                  {token.category.charAt(0).toUpperCase() + token.category.slice(1)}
                </Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterPill, selectedCategory === 'all' && styles.activeFilter]}
              onPress={() => handleCategorySelect('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, selectedCategory === 'all' && styles.activeFilterText]}>
                All Rewards
              </Text>
            </TouchableOpacity>
            {tokenBalances.map((token) => (
              <TouchableOpacity
                key={token.category}
                style={[styles.filterPill, selectedCategory === token.category && styles.activeFilter]}
                onPress={() => handleCategorySelect(token.category)}
                activeOpacity={0.8}
              >
                {getCategoryIcon(token.category)}
                <Text style={[styles.filterText, selectedCategory === token.category && styles.activeFilterText]}>
                  {token.category.charAt(0).toUpperCase() + token.category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Rewards */}
        <Animated.View style={[styles.section, slideStyle]}>
          <Text style={styles.sectionTitle}>Featured Rewards</Text>
          {featuredRewards
            .filter(reward => selectedCategory === 'all' || reward.category === selectedCategory)
            .map((reward) => (
              <TouchableOpacity
                key={reward.id}
                style={[styles.rewardCard, !reward.available && styles.unavailableCard]}
                activeOpacity={reward.available ? 0.8 : 1}
                disabled={!reward.available}
              >
                <View style={styles.rewardImage}>
                  <Text style={styles.rewardImagePlaceholder}>
                    {reward.brand.charAt(0)}
                  </Text>
                  {reward.featured && (
                    <View style={styles.featuredBadge}>
                      <Star size={12} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                    </View>
                  )}
                </View>
                
                <View style={styles.rewardContent}>
                  <View style={styles.rewardInfo}>
                    <Text style={[styles.rewardTitle, !reward.available && styles.unavailableText]}>
                      {reward.title}
                    </Text>
                    <Text style={[styles.rewardDescription, !reward.available && styles.unavailableText]}>
                      {reward.description}
                    </Text>
                    <View style={styles.rewardMeta}>
                      <Text style={styles.brandName}>{reward.brand}</Text>
                      {reward.originalPrice && (
                        <Text style={styles.originalPrice}>Worth {reward.originalPrice}</Text>
                      )}
                      {reward.discount && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{reward.discount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.rewardAction}>
                    <View style={styles.costContainer}>
                      <Text style={[styles.costAmount, !reward.available && styles.unavailableText]}>
                        {reward.cost}
                      </Text>
                      <Text style={[styles.costLabel, !reward.available && styles.unavailableText]}>
                        tokens
                      </Text>
                    </View>
                    {reward.available && (
                      <ChevronRight size={16} color="#6E6E73" strokeWidth={2} />
                    )}
                  </View>
                </View>
                
                {!reward.available && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableBadgeText}>
                      Need {reward.cost - (tokenBalances.find(t => t.category === reward.category)?.balance || 0)} more tokens
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
        </Animated.View>

        {/* Achievements Section */}
        {showAchievements && (
          <Animated.View style={[styles.section, achievementStyle]}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  {achievement.icon}
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementProgress}>
                    <View style={styles.progressBarSmall}>
                      <View 
                        style={[
                          styles.progressFillSmall, 
                          { width: `${(achievement.progress / achievement.total) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress}/{achievement.total}
                    </Text>
                  </View>
                </View>
                <View style={styles.achievementReward}>
                  <Text style={styles.rewardAmount}>+{achievement.reward}</Text>
                  <Text style={styles.rewardLabel}>tokens</Text>
                  {achievement.completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* How to Earn More */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earn More Tokens</Text>
          <View style={styles.earnCard}>
            <View style={styles.earnItem}>
              <View style={styles.earnIcon}>
                <Text style={styles.earnPoints}>+15</Text>
              </View>
              <Text style={styles.earnText}>Complete a ride</Text>
            </View>
            <View style={styles.earnItem}>
              <View style={styles.earnIcon}>
                <Text style={styles.earnPoints}>+25</Text>
              </View>
              <Text style={styles.earnText}>5-star rating received</Text>
            </View>
            <View style={styles.earnItem}>
              <View style={styles.earnIcon}>
                <Text style={styles.earnPoints}>+50</Text>
              </View>
              <Text style={styles.earnText}>Refer a friend</Text>
            </View>
            <View style={styles.earnItem}>
              <View style={styles.earnIcon}>
                <Text style={styles.earnPoints}>+100</Text>
              </View>
              <Text style={styles.earnText}>Weekly challenge</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    lineHeight: 36,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 24,
  },
  achievementButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
  },
  balanceValue: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 44,
  },
  balanceSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  progressTokens: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 16,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tokenCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenBalance: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  tokenCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    gap: 6,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 20,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  rewardCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  unavailableCard: {
    opacity: 0.6,
  },
  rewardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  rewardImagePlaceholder: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#6E6E73',
  },
  featuredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 4,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 16,
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
  },
  discountBadge: {
    backgroundColor: '#34C759',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  rewardAction: {
    alignItems: 'flex-end',
  },
  costContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  costAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  costLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
  },
  unavailableText: {
    opacity: 0.5,
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unavailableBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  achievementCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarSmall: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 16,
  },
  achievementReward: {
    alignItems: 'center',
    position: 'relative',
  },
  rewardAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#34C759',
    lineHeight: 22,
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  earnCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  earnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  earnPoints: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  earnText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 22,
  },
});