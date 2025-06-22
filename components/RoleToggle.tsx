import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Car, UserCheck } from 'lucide-react-native';
import { useRole } from '@/components/RoleContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function RoleToggle() {
  const { role, toggleRole } = useRole();
  const slideAnimation = useSharedValue(role === 'rider' ? 0 : 1);

  const handleToggle = () => {
    toggleRole();
    slideAnimation.value = withSpring(role === 'rider' ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  };

  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideAnimation.value * 120 }],
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggle} onPress={handleToggle} activeOpacity={0.8}>
        <Animated.View style={[styles.slider, sliderStyle]} />
        
        <View style={[styles.option, role === 'rider' && styles.activeOption]}>
          <UserCheck 
            size={16} 
            color={role === 'rider' ? '#FFFFFF' : '#6E6E73'} 
            strokeWidth={2} 
          />
          <Text style={[styles.optionText, role === 'rider' && styles.activeText]}>
            Rider
          </Text>
        </View>
        
        <View style={[styles.option, role === 'driver' && styles.activeOption]}>
          <Car 
            size={16} 
            color={role === 'driver' ? '#FFFFFF' : '#6E6E73'} 
            strokeWidth={2} 
          />
          <Text style={[styles.optionText, role === 'driver' && styles.activeText]}>
            Driver
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  slider: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 120,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    zIndex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 40,
    borderRadius: 8,
    zIndex: 2,
    gap: 6,
  },
  activeOption: {
    // Active styling handled by slider background
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 20,
  },
  activeText: {
    color: '#FFFFFF',
  },
});