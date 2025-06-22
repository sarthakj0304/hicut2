import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Star, Phone, MessageCircle } from 'lucide-react-native';

interface RideStatusCardProps {
  status: 'waiting' | 'on-trip' | 'completed';
  driverName?: string;
  driverRating?: number;
  carModel?: string;
  eta?: string;
  pickup?: string;
  destination?: string;
  tokens?: number;
  onContact?: () => void;
  onCancel?: () => void;
}

export default function RideStatusCard({
  status,
  driverName = 'Alex M.',
  driverRating = 4.9,
  carModel = 'Honda Civic',
  eta = '3 min',
  pickup = 'Central Station',
  destination = 'University Campus',
  tokens = 15,
  onContact,
  onCancel
}: RideStatusCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'waiting':
        return {
          title: 'Driver is on the way',
          subtitle: `${driverName} will arrive in ${eta}`,
          color: '#007AFF'
        };
      case 'on-trip':
        return {
          title: 'On your way',
          subtitle: `Heading to ${destination}`,
          color: '#34C759'
        };
      case 'completed':
        return {
          title: 'Trip completed',
          subtitle: `You earned +${tokens} tokens`,
          color: '#34C759'
        };
      default:
        return {
          title: 'Ride Status',
          subtitle: 'Unknown status',
          color: '#6E6E73'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
          <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
        </View>
      </View>

      {status !== 'completed' && (
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>
              {driverName.charAt(0)}
            </Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driverName}</Text>
            <View style={styles.driverMeta}>
              <Star size={12} color="#FFD700" fill="#FFD700" strokeWidth={0} />
              <Text style={styles.driverRating}>{driverRating}</Text>
              <Text style={styles.driverCar}>• {carModel}</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onContact}
              activeOpacity={0.8}
            >
              <Phone size={16} color="#007AFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onContact}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#007AFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.pickupDot} />
          <Text style={styles.routeText}>{pickup}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <MapPin size={16} color="#FF3B30" strokeWidth={2} fill="#FF3B30" />
          <Text style={styles.routeText}>{destination}</Text>
        </View>
      </View>

      {status === 'completed' && (
        <View style={styles.completedReward}>
          <Text style={styles.rewardText}>Tokens Earned</Text>
          <Text style={styles.rewardAmount}>+{tokens}</Text>
        </View>
      )}

      {status !== 'completed' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    lineHeight: 22,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6E6E73',
    lineHeight: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 16,
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
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  routeContainer: {
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
  completedReward: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  rewardAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  actions: {
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6E6E73',
    lineHeight: 20,
  },
});