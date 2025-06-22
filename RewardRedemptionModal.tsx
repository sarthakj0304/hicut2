import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { X, Gift, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

interface RewardRedemptionModalProps {
  visible: boolean;
  reward: {
    id: string;
    title: string;
    description: string;
    cost: number;
    brand: string;
    image: string;
    category: string;
    originalPrice?: string;
    discount?: string;
    terms?: string[];
  } | null;
  userTokens: number;
  onClose: () => void;
  onRedeem: (rewardId: string) => void;
}

export default function RewardRedemptionModal({
  visible,
  reward,
  userTokens,
  onClose,
  onRedeem
}: RewardRedemptionModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      setRedeemed(false);
      setIsRedeeming(false);
    }
  }, [visible]);

  const handleRedeem = async () => {
    if (!reward || userTokens < reward.cost) return;
    
    setIsRedeeming(true);
    buttonScale.value = withSpring(0.95);
    
    // Simulate API call
    setTimeout(() => {
      setIsRedeeming(false);
      setRedeemed(true);
      buttonScale.value = withSpring(1);
      onRedeem(reward.id);
      
      // Auto close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!reward) return null;

  const canRedeem = userTokens >= reward.cost;
  const tokensNeeded = reward.cost - userTokens;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, modalStyle]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <X size={24} color="#6E6E73" strokeWidth={2} />
          </TouchableOpacity>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Reward Image */}
            <View style={styles.imageContainer}>
              <View style={styles.rewardImage}>
                <Text style={styles.brandInitial}>{reward.brand.charAt(0)}</Text>
              </View>
              {reward.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{reward.discount}</Text>
                </View>
              )}
            </View>

            {/* Reward Info */}
            <View style={styles.rewardInfo}>
              <Text style={styles.brandName}>{reward.brand}</Text>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardDescription}>{reward.description}</Text>
              
              {reward.originalPrice && (
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>Worth {reward.originalPrice}</Text>
                </View>
              )}
            </View>

            {/* Cost */}
            <View style={styles.costSection}>
              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Cost</Text>
                <View style={styles.costAmount}>
                  <Text style={styles.costTokens}>{reward.cost}</Text>
                  <Text style={styles.costText}>tokens</Text>
                </View>
              </View>
              
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Your Balance</Text>
                <Text style={[
                  styles.balanceAmount,
                  canRedeem ? styles.sufficientBalance : styles.insufficientBalance
                ]}>
                  {userTokens} tokens
                </Text>
              </View>
            </View>

            {/* Terms */}
            {reward.terms && (
              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                {reward.terms.map((term, index) => (
                  <Text key={index} style={styles.termItem}>• {term}</Text>
                ))}
              </View>
            )}

            {/* Status Messages */}
            {!canRedeem && (
              <View style={styles.warningContainer}>
                <AlertCircle size={20} color="#FF9500" strokeWidth={2} />
                <Text style={styles.warningText}>
                  You need {tokensNeeded} more tokens to redeem this reward
                </Text>
              </View>
            )}

            {redeemed && (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color="#34C759" strokeWidth={2} />
                <Text style={styles.successText}>
                  Reward redeemed successfully! Check your email for details.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Animated.View style={buttonStyle}>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  !canRedeem && styles.disabledButton,
                  redeemed && styles.redeemedButton
                ]}
                onPress={handleRedeem}
                disabled={!canRedeem || isRedeeming || redeemed}
                activeOpacity={0.8}
              >
                {isRedeeming ? (
                  <View style={styles.loadingContainer}>
                    <Clock size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.buttonText}>Redeeming...</Text>
                  </View>
                ) : redeemed ? (
                  <View style={styles.loadingContainer}>
                    <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.buttonText}>Redeemed!</Text>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Gift size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.buttonText}>
                      {canRedeem ? 'Redeem Reward' : `Need ${tokensNeeded} More Tokens`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  rewardImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInitial: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#6E6E73',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  rewardInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 24,
    textAlign: 'center',
  },
  priceContainer: {
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#34C759',
    lineHeight: 20,
  },
  costSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 22,
  },
  costAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  costTokens: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    lineHeight: 28,
  },
  costText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 22,
  },
  balanceAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 22,
  },
  sufficientBalance: {
    color: '#34C759',
  },
  insufficientBalance: {
    color: '#FF3B30',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
    marginBottom: 12,
  },
  termItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#856404',
    lineHeight: 20,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4EDDA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#155724',
    lineHeight: 20,
    flex: 1,
  },
  actionContainer: {
    padding: 24,
    paddingTop: 0,
  },
  redeemButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  redeemedButton: {
    backgroundColor: '#34C759',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
});