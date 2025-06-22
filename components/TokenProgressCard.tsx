import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Target, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';

interface TokenProgressCardProps {
  currentTokens: number;
  nextTierTokens: number;
  tierName: string;
  benefits: string[];
  animated?: boolean;
}

export default function TokenProgressCard({
  currentTokens,
  nextTierTokens,
  tierName,
  benefits,
  animated = true
}: TokenProgressCardProps) {
  const progress = currentTokens / nextTierTokens;
  const tokensNeeded = nextTierTokens - currentTokens;
  
  const progressAnimation = useSharedValue(0);
  const cardScale = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      progressAnimation.value = withTiming(progress, { duration: 1000 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      progressAnimation.value = progress;
    }
  }, [progress, animated]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'silver': return ['#C0C0C0', '#E8E8E8'];
      case 'gold': return ['#FFD700', '#FFA500'];
      case 'platinum': return ['#E5E4E2', '#BCC6CC'];
      case 'diamond': return ['#B9F2FF', '#00D4FF'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'silver': return <Target size={24} color="#FFFFFF" strokeWidth={2} />;
      case 'gold': return <TrendingUp size={24} color="#FFFFFF" strokeWidth={2} />;
      case 'platinum': return <Zap size={24} color="#FFFFFF" strokeWidth={2} />;
      case 'diamond': return <Zap size={24} color="#FFFFFF" strokeWidth={2} />;
      default: return <Target size={24} color="#FFFFFF" strokeWidth={2} />;
    }
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <LinearGradient
        colors={getTierColor(tierName)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.tierInfo}>
            <Text style={styles.tierLabel}>Next Tier</Text>
            <Text style={styles.tierName}>{tierName}</Text>
          </View>
          <View style={styles.tierIcon}>
            {getTierIcon(tierName)}
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.currentTokens}>{currentTokens}</Text>
            <Text style={styles.totalTokens}>/ {nextTierTokens} tokens</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          
          <Text style={styles.tokensNeeded}>
            {tokensNeeded} tokens to unlock {tierName}
          </Text>
        </View>

        {benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Unlock Benefits:</Text>
            {benefits.slice(0, 2).map((benefit, index) => (
              <Text key={index} style={styles.benefitItem}>
                • {benefit}
              </Text>
            ))}
            {benefits.length > 2 && (
              <Text style={styles.moreBenefits}>
                +{benefits.length - 2} more benefits
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 4,
  },
  tierName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    gap: 4,
  },
  currentTokens: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  totalTokens: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 20,
    minWidth: 40,
    textAlign: 'right',
  },
  tokensNeeded: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  benefitsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
    marginBottom: 4,
  },
  moreBenefits: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.7,
    lineHeight: 16,
    marginTop: 4,
  },
});