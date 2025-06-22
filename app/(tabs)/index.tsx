import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Clock, Star, Zap, Users, Car } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useRole } from '@/components/RoleContext';
import RoleToggle from '@/components/RoleToggle';

const { width, height } = Dimensions.get('window');

interface Driver {
  id: string;
  name: string;
  rating: number;
  eta: string;
  distance: string;
  carModel: string;
  avatar: string;
  lat: number;
  lng: number;
  tokens: number;
}

interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  distance: string;
  pickup: string;
  destination: string;
  tokens: number;
  eta: string;
}

const mockDrivers: Driver[] = [
  { 
    id: '1', 
    name: 'Alex M.', 
    rating: 4.9, 
    eta: '3 min', 
    distance: '0.8 km',
    carModel: 'Honda Civic', 
    avatar: 'AM',
    lat: 0.3,
    lng: 0.25,
    tokens: 15
  },
  { 
    id: '2', 
    name: 'Sarah K.', 
    rating: 4.8, 
    eta: '5 min', 
    distance: '1.2 km',
    carModel: 'Toyota Camry', 
    avatar: 'SK',
    lat: 0.6,
    lng: 0.7,
    tokens: 12
  },
  { 
    id: '3', 
    name: 'Mike R.', 
    rating: 4.9, 
    eta: '7 min', 
    distance: '1.8 km',
    carModel: 'Nissan Altima', 
    avatar: 'MR',
    lat: 0.2,
    lng: 0.8,
    tokens: 18
  },
];

const mockRideRequests: RideRequest[] = [
  {
    id: '1',
    riderId: 'r1',
    riderName: 'Emma L.',
    distance: '300 m',
    pickup: 'Central Station',
    destination: 'University Campus',
    tokens: 15,
    eta: '2 min'
  },
  {
    id: '2',
    riderId: 'r2',
    riderName: 'James W.',
    distance: '800 m',
    pickup: 'Shopping Mall',
    destination: 'Business District',
    tokens: 20,
    eta: '5 min'
  }
];

export default function MapScreen() {
  const { role } = useRole();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showDrivers, setShowDrivers] = useState(false);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [rideStatus, setRideStatus] = useState<'idle' | 'requesting' | 'matched' | 'in-progress' | 'completed'>('idle');
  
  const bottomSheetHeight = useSharedValue(200);
  const radarPulse = useSharedValue(0);
  const requestPulse = useSharedValue(0);

  // Radar animation for drivers
  useEffect(() => {
    if (role === 'driver') {
      radarPulse.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      );
    }
  }, [role]);

  // Request pulse animation
  useEffect(() => {
    if (showRideRequest) {
      requestPulse.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    }
  }, [showRideRequest]);

  const handleLocationSelect = () => {
    if (role === 'rider') {
      setShowDrivers(true);
      bottomSheetHeight.value = withSpring(500);
    } else {
      // Driver mode - show ride request
      const randomRequest = mockRideRequests[Math.floor(Math.random() * mockRideRequests.length)];
      setActiveRequest(randomRequest);
      setShowRideRequest(true);
      bottomSheetHeight.value = withSpring(400);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  const handleBookRide = () => {
    setRideStatus('requesting');
    setTimeout(() => {
      setRideStatus('matched');
      bottomSheetHeight.value = withSpring(300);
    }, 2000);
  };

  const handleAcceptRequest = () => {
    setShowRideRequest(false);
    setRideStatus('matched');
    bottomSheetHeight.value = withSpring(350);
  };

  const handleDeclineRequest = () => {
    setShowRideRequest(false);
    setActiveRequest(null);
    bottomSheetHeight.value = withSpring(200);
  };

  const bottomSheetStyle = useAnimatedStyle(() => ({
    height: bottomSheetHeight.value,
  }));

  const radarStyle = useAnimatedStyle(() => {
    const scale = interpolate(radarPulse.value, [0, 1], [1, 2]);
    const opacity = interpolate(radarPulse.value, [0, 1], [0.8, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const requestPulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(requestPulse.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(requestPulse.value, [0, 1], [1, 0.6]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Role Toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {role === 'rider' ? 'Find a Ride' : 'Drive Mode'}
        </Text>
        <RoleToggle />
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            {/* User Location */}
            <View style={styles.userLocation}>
              <View style={styles.userDot} />
              <View style={styles.pulseRing} />
              {role === 'driver' && (
                <Animated.View style={[styles.radarRing, radarStyle]} />
              )}
            </View>
            
            {/* Driver/Rider locations based on role */}
            {role === 'rider' ? (
              // Show drivers for riders
              mockDrivers.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  style={[
                    styles.driverLocation,
                    { 
                      top: `${driver.lat * 100}%`, 
                      left: `${driver.lng * 100}%` 
                    }
                  ]}
                  onPress={() => handleDriverSelect(driver.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.driverDot,
                    selectedDriver === driver.id && styles.selectedDriverDot
                  ]}>
                    <Car size={12} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  {selectedDriver === driver.id && (
                    <View style={styles.driverPreview}>
                      <Text style={styles.driverPreviewName}>{driver.name}</Text>
                      <Text style={styles.driverPreviewEta}>{driver.eta}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              // Show ride requests for drivers
              showRideRequest && activeRequest && (
                <Animated.View 
                  style={[
                    styles.rideRequestMarker,
                    { top: '40%', left: '60%' },
                    requestPulseStyle
                  ]}
                >
                  <View style={styles.requestDot}>
                    <Users size={12} color="#FFFFFF" strokeWidth={2} />
                  </View>
                </Animated.View>
              )
            )}
          </View>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[
            styles.locationButton,
            role === 'driver' && styles.driverModeButton
          ]}
          onPress={handleLocationSelect}
          activeOpacity={0.8}
        >
          {role === 'rider' ? (
            <Navigation size={20} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Zap size={20} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
        <View style={styles.bottomSheetHandle} />
        
        {/* Rider Mode Content */}
        {role === 'rider' && !showDrivers && rideStatus === 'idle' && (
          <View style={styles.locationSelector}>
            <Text style={styles.sectionTitle}>Where to?</Text>
            <TouchableOpacity 
              style={styles.locationInput}
              onPress={handleLocationSelect}
              activeOpacity={0.8}
            >
              <MapPin size={20} color="#6E6E73" strokeWidth={2} />
              <Text style={styles.locationInputText}>Enter destination</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Available Drivers */}
        {role === 'rider' && showDrivers && rideStatus === 'idle' && (
          <ScrollView style={styles.driversContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Available drivers nearby</Text>
            <Text style={styles.sectionSubtitle}>Within 2km radius</Text>
            
            {mockDrivers.map((driver) => (
              <TouchableOpacity
                key={driver.id}
                style={[
                  styles.driverCard,
                  selectedDriver === driver.id && styles.selectedDriverCard
                ]}
                onPress={() => handleDriverSelect(driver.id)}
                activeOpacity={0.8}
              >
                <View style={styles.driverInfo}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitial}>
                      {driver.avatar}
                    </Text>
                  </View>
                  <View style={styles.driverDetails}>
                    <Text style={[
                      styles.driverName,
                      selectedDriver === driver.id && styles.selectedText
                    ]}>
                      {driver.name}
                    </Text>
                    <View style={styles.driverMeta}>
                      <Star size={12} color="#FFD700" fill="#FFD700" strokeWidth={0} />
                      <Text style={[
                        styles.driverRating,
                        selectedDriver === driver.id && styles.selectedSubText
                      ]}>
                        {driver.rating}
                      </Text>
                      <Text style={[
                        styles.driverCar,
                        selectedDriver === driver.id && styles.selectedSubText
                      ]}>
                        • {driver.carModel}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rideInfo}>
                  <View style={styles.tokenReward}>
                    <Text style={[
                      styles.tokenAmount,
                      selectedDriver === driver.id && styles.selectedText
                    ]}>
                      +{driver.tokens}
                    </Text>
                    <Text style={[
                      styles.tokenLabel,
                      selectedDriver === driver.id && styles.selectedSubText
                    ]}>
                      tokens
                    </Text>
                  </View>
                  <View style={styles.etaContainer}>
                    <Clock size={12} color={selectedDriver === driver.id ? '#FFFFFF' : '#6E6E73'} strokeWidth={2} />
                    <Text style={[
                      styles.eta,
                      selectedDriver === driver.id && styles.selectedSubText
                    ]}>
                      {driver.eta}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {selectedDriver && (
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={handleBookRide}
                activeOpacity={0.8}
              >
                <Text style={styles.bookButtonText}>Request Ride</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Driver Mode - Ride Request */}
        {role === 'driver' && showRideRequest && activeRequest && (
          <View style={styles.requestContainer}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>Ride Request</Text>
              <View style={styles.requestDistance}>
                <Text style={styles.distanceText}>{activeRequest.distance} away</Text>
              </View>
            </View>
            
            <View style={styles.requestDetails}>
              <View style={styles.riderInfo}>
                <View style={styles.riderAvatar}>
                  <Text style={styles.riderInitial}>
                    {activeRequest.riderName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.riderName}>{activeRequest.riderName}</Text>
                  <Text style={styles.requestEta}>Pickup in {activeRequest.eta}</Text>
                </View>
              </View>
              
              <View style={styles.routeInfo}>
                <View style={styles.routePoint}>
                  <View style={styles.pickupDot} />
                  <Text style={styles.routeText}>{activeRequest.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <MapPin size={16} color="#FF3B30" strokeWidth={2} fill="#FF3B30" />
                  <Text style={styles.routeText}>{activeRequest.destination}</Text>
                </View>
              </View>
              
              <View style={styles.requestReward}>
                <Text style={styles.rewardAmount}>+{activeRequest.tokens}</Text>
                <Text style={styles.rewardLabel}>tokens</Text>
              </View>
            </View>
            
            <View style={styles.requestActions}>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={handleDeclineRequest}
                activeOpacity={0.8}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAcceptRequest}
                activeOpacity={0.8}
              >
                <Text style={styles.acceptButtonText}>Accept Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ride Status */}
        {rideStatus === 'requesting' && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Finding your ride...</Text>
            <Text style={styles.statusSubtitle}>Connecting with nearby drivers</Text>
          </View>
        )}

        {rideStatus === 'matched' && (
          <View style={styles.matchedContainer}>
            <Text style={styles.matchedTitle}>
              {role === 'rider' ? 'Driver Found!' : 'Ride Accepted!'}
            </Text>
            <Text style={styles.matchedSubtitle}>
              {role === 'rider' ? 'Alex M. is on the way' : 'Heading to pickup location'}
            </Text>
            <View style={styles.matchedActions}>
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 28,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  mapContent: {
    flex: 1,
    position: 'relative',
  },
  userLocation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 3,
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: 1,
  },
  radarRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#34C759',
    top: -30,
    left: -30,
    zIndex: 2,
  },
  driverLocation: {
    position: 'absolute',
  },
  driverDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDriverDot: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  driverPreview: {
    position: 'absolute',
    top: -40,
    left: -20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    minWidth: 80,
    alignItems: 'center',
  },
  driverPreviewName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 16,
  },
  driverPreviewEta: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 14,
  },
  rideRequestMarker: {
    position: 'absolute',
  },
  requestDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9500',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    position: 'absolute',
    bottom: 220,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  driverModeButton: {
    backgroundColor: '#34C759',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#E5E5E7',
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  locationSelector: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginBottom: 16,
    lineHeight: 20,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  locationInputText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginLeft: 12,
    lineHeight: 24,
  },
  driversContainer: {
    flex: 1,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  selectedDriverCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  selectedSubText: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  driverRating: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginLeft: 4,
    lineHeight: 20,
  },
  driverCar: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginLeft: 4,
    lineHeight: 20,
  },
  rideInfo: {
    alignItems: 'flex-end',
  },
  tokenReward: {
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#34C759',
    lineHeight: 22,
  },
  tokenLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 16,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginLeft: 4,
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  requestContainer: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  requestTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  requestDistance: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  requestDetails: {
    marginBottom: 24,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderInitial: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  riderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  requestEta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  routeInfo: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E5E7',
    marginLeft: 7,
    marginRight: 12,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  requestReward: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  rewardAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#34C759',
    lineHeight: 32,
  },
  rewardLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  declineButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6E6E73',
    lineHeight: 24,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 24,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  matchedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#34C759',
    marginBottom: 8,
    lineHeight: 28,
  },
  matchedSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginBottom: 24,
    lineHeight: 24,
  },
  matchedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6E6E73',
    lineHeight: 24,
  },
});