import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';

interface BottomAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onHide?: () => void;
  duration?: number;
}

export default function BottomAlert({
  visible,
  type,
  message,
  onHide,
  duration = 3000
}: BottomAlertProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);

      // Auto hide after duration
      if (onHide) {
        const timer = withDelay(duration, withSpring(100, undefined, () => {
          opacity.value = withSpring(0, undefined, () => {
            runOnJS(onHide)();
          });
        }));
        translateY.value = timer;
      }
    } else {
      translateY.value = withSpring(100);
      opacity.value = withSpring(0);
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#34C759', icon: CheckCircle };
      case 'error':
        return { backgroundColor: '#FF3B30', icon: AlertCircle };
      case 'info':
        return { backgroundColor: '#007AFF', icon: Info };
      default:
        return { backgroundColor: '#6E6E73', icon: Info };
    }
  };

  const { backgroundColor, icon: IconComponent } = getAlertStyle();

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor }]}>
      <IconComponent size={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
    lineHeight: 22,
    flex: 1,
  },
});