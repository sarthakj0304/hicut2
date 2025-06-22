import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Car, UserCheck, MapPin, Award, Users } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  interpolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Role = 'rider' | 'driver' | null;

interface OnboardingSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    icon: <Users size={48} color="#007AFF" strokeWidth={2} />,
    title: "Welcome to HICUT",
    subtitle: "Community-Driven Rides",
    description: "Connect with your community for short and medium-distance lifts. No cash needed - earn reward tokens instead."
  },
  {
    id: 2,
    icon: <Award size={48} color="#34C759" strokeWidth={2} />,
    title: "Earn Reward Tokens",
    subtitle: "Every Ride Counts",
    description: "Complete rides to earn tokens for food, travel gear, clothing, and exclusive coupons. The more you ride, the more you earn."
  },
  {
    id: 3,
    icon: <MapPin size={48} color="#FF9500" strokeWidth={2} />,
    title: "Find Rides Nearby",
    subtitle: "Within 2km Radius",
    description: "Discover available rides or offer lifts to people in your area. Safe, community-driven transportation made simple."
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const scaleRider = useSharedValue(1);
  const scaleDriver = useSharedValue(1);
  const opacity = useSharedValue(1);
  const slideProgress = useSharedValue(0);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      slideProgress.value = withSpring(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      setShowRoleSelection(true);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      slideProgress.value = withSpring(prevSlide);
      scrollViewRef.current?.scrollTo({ x: prevSlide * width, animated: true });
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    
    if (role === 'rider') {
      scaleRider.value = withSpring(0.95);
      scaleDriver.value = withSpring(1);
    } else {
      scaleDriver.value = withSpring(0.95);
      scaleRider.value = withSpring(1);
    }

    // Navigate after animation
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(router.replace)('/(tabs)');
      });
    }, 200);
  };

  const riderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleRider.value }],
  }));

  const driverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleDriver.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(slideProgress.value, [0, onboardingSlides.length - 1], [0, 1]);
    return {
      width: `${progress * 100}%`,
    };
  });

  if (showRoleSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, containerAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>How would you like to get started?</Text>
          </View>

          <View style={styles.choicesContainer}>
            <Animated.View style={riderAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'rider' && styles.selectedButton
                ]}
                onPress={() => handleRoleSelect('rider')}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  <UserCheck 
                    size={32} 
                    color={selectedRole === 'rider' ? '#FFFFFF' : '#1D1D1F'} 
                    strokeWidth={2}
                  />
                </View>
                <Text style={[
                  styles.roleTitle,
                  selectedRole === 'rider' && styles.selectedText
                ]}>
                  I need a ride
                </Text>
                <Text style={[
                  styles.roleDescription,
                  selectedRole === 'rider' && styles.selectedDescription
                ]}>
                  Book trips and get around the city
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={driverAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'driver' && styles.selectedButton
                ]}
                onPress={() => handleRoleSelect('driver')}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  <Car 
                    size={32} 
                    color={selectedRole === 'driver' ? '#FFFFFF' : '#1D1D1F'} 
                    strokeWidth={2}
                  />
                </View>
                <Text style={[
                  styles.roleTitle,
                  selectedRole === 'driver' && styles.selectedText
                ]}>
                  I want to drive
                </Text>
                <Text style={[
                  styles.roleDescription,
                  selectedRole === 'driver' && styles.selectedDescription
                ]}>
                  Earn tokens by giving rides
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.onboardingContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.slidesContainer}
        >
          {onboardingSlides.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={styles.slideIcon}>
                  {slide.icon}
                </View>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                <Text style={styles.slideDescription}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
            disabled={currentSlide === 0}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.navButtonText,
              currentSlide === 0 && styles.disabledText
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.activeDot
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 24,
  },
  onboardingContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  slideIcon: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  slideTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  slideSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  slideDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    lineHeight: 22,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  disabledText: {
    color: '#E5E5E7',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E7',
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  choicesContainer: {
    gap: 24,
  },
  roleButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    minHeight: 180,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  iconContainer: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  selectedDescription: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
});