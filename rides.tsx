import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, Star, ChevronRight } from 'lucide-react-native';

interface Ride {
  id: string;
  date: string;
  from: string;
  to: string;
  driver: string;
  rating: number;
  price: string;
  status: 'completed' | 'cancelled' | 'upcoming';
}

const mockRides: Ride[] = [
  {
    id: '1',
    date: 'Today, 2:30 PM',
    from: 'CP',
    to: 'Lajpat Nagar',
    driver: 'Parth.K',
    rating: 5,
    price: '6 tokens',
    status: 'upcoming'
  },
  {
    id: '2',
    date: 'Yesterday, 6:15 PM',
    from: 'Dehradun City',
    to: 'Bhidoli',
    driver: 'Shreeya.J',
    rating: 4,
    price: '14 Tokens',
    status: 'completed' 
  },
  {
    id: '3',
    date: 'Dec 20, 9:45 AM',
    from: 'Airport Terminal 2',
    to: 'Home',
    driver: 'Sarthak',
    rating: 5,
    price: '40 tokens',
    status: 'completed'
  },
  {
    id: '4',
    date: 'Dec 18, 3:20 PM',
    from: 'Central Park',
    to: 'Bandra',
    driver: 'Addy',
    rating: 0,
    price: '22 tokens',
    status: 'cancelled'
  }
];

export default function RidesScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#007AFF';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#6E6E73';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Rides</Text>
        <Text style={styles.subtitle}>Trip history and upcoming rides</Text>
      </View>

      <ScrollView style={styles.ridesContainer} showsVerticalScrollIndicator={false}>
        {mockRides.map((ride) => (
          <TouchableOpacity 
            key={ride.id} 
            style={styles.rideCard}
            activeOpacity={0.8}
          >
            <View style={styles.rideHeader}>
              <View style={styles.dateContainer}>
                <Clock size={16} color="#6E6E73" strokeWidth={2} />
                <Text style={styles.rideDate}>{ride.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                  {getStatusText(ride.status)}
                </Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <View style={styles.fromDot} />
                <Text style={styles.locationText}>{ride.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <MapPin size={16} color="#FF3B30" strokeWidth={2} fill="#FF3B30" />
                <Text style={styles.locationText}>{ride.to}</Text>
              </View>
            </View>

            <View style={styles.rideFooter}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitial}>
                    {ride.driver.charAt(0)}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{ride.driver}</Text>
                  {ride.status === 'completed' && ride.rating > 0 && (
                    <View style={styles.ratingContainer}>
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={12}
                          color={index < ride.rating ? '#FFD700' : '#E5E5E7'}
                          fill={index < ride.rating ? '#FFD700' : 'transparent'}
                          strokeWidth={1}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{ride.price}</Text>
                <ChevronRight size={16} color="#6E6E73" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  ridesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  rideCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    marginLeft: 6,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fromDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
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
  locationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginRight: 8,
    lineHeight: 22,
  },
});