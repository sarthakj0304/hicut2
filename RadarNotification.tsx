import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, MapPin, Clock } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface RadarNotificationProps {
  visible: boolean;
  riderName: string;
  distance: string;
  pickup: string;
  destination: string;
  tokens: number;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function RadarNotification({
  visible,
  riderName,
  distance,
  pickup,
  destination,
  tokens,
  onAccept,
  onDismiss
}: RadarNotificationProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);

      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <View style={styles.alertIcon}>
          <Users size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Ride Request</Text>
          <Text style={styles.distance}>{distance} away</Text>
        </View>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenText}>+{tokens}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.riderName}>{riderName}</Text>
        <View style={styles.route}>
          <View style={styles.routePoint}>
            <View style={styles.pickupDot} />
            <Text style={styles.routeText} numberOfLines={1}>{pickup}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <MapPin size={12} color="#FF3B30" strokeWidth={2} fill="#FF3B30" />
            <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  distance: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  tokenBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  content: {
    marginBottom: 16,
  },
  riderName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 24,
  },
  route: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: '#E5E5E7',
    marginLeft: 5,
    marginRight: 8,
    marginBottom: 6,
  },
  routeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 20,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 20,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});