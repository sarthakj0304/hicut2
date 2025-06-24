import { useState, useEffect } from 'react';
import { apiClient, Ride, wsService } from '@/services/api';
import { useAuth } from './useAuth';

export function useRides() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get ride history
  const fetchRideHistory = async (page = 1, limit = 10, status?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getRideHistory(page, limit, status);
      
      if (response.success && response.data) {
        setRides(response.data.rides);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch rides');
        return null;
      }
    } catch (error) {
      console.error('Fetch rides error:', error);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get nearby rides (for riders)
  const fetchNearbyRides = async (lat: number, lng: number, radius = 2000) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getNearbyRides(lat, lng, radius);
      
      if (response.success && response.data) {
        setNearbyRides(response.data.rides);
        return response.data.rides;
      } else {
        setError(response.message || 'Failed to fetch nearby rides');
        return [];
      }
    } catch (error) {
      console.error('Fetch nearby rides error:', error);
      setError('Network error. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new ride (for drivers)
  const createRide = async (rideData: {
    pickup: {
      location: { coordinates: [number, number] };
      address: string;
      landmark?: string;
    };
    destination: {
      location: { coordinates: [number, number] };
      address: string;
      landmark?: string;
    };
    scheduledTime?: string;
    maxPassengers?: number;
    notes?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.createRide(rideData);
      
      if (response.success && response.data) {
        // Add to rides list
        setRides(prev => [response.data!.ride, ...prev]);
        return { success: true, ride: response.data.ride };
      } else {
        setError(response.message || 'Failed to create ride');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Create ride error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Join a ride (for riders)
  const joinRide = async (rideId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.joinRide(rideId);
      
      if (response.success && response.data) {
        // Update rides list
        setRides(prev => prev.map(ride => 
          ride._id === rideId ? response.data!.ride : ride
        ));
        setNearbyRides(prev => prev.filter(ride => ride._id !== rideId));
        return { success: true, ride: response.data.ride };
      } else {
        setError(response.message || 'Failed to join ride');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Join ride error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update ride status
  const updateRideStatus = async (rideId: string, status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.updateRideStatus(rideId, status);
      
      if (response.success && response.data) {
        // Update rides list
        setRides(prev => prev.map(ride => 
          ride._id === rideId ? response.data!.ride : ride
        ));
        return { success: true, ride: response.data.ride };
      } else {
        setError(response.message || 'Failed to update ride status');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update ride status error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Rate a ride
  const rateRide = async (rideId: string, rating: number, feedback?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.rateRide(rideId, rating, feedback);
      
      if (response.success && response.data) {
        // Update rides list
        setRides(prev => prev.map(ride => 
          ride._id === rideId ? response.data!.ride : ride
        ));
        return { success: true, ride: response.data.ride };
      } else {
        setError(response.message || 'Failed to rate ride');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Rate ride error:', error);
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket event handlers
  useEffect(() => {
    if (user) {
      // Listen for ride updates
      wsService.onRideRequest((data) => {
        console.log('New ride request:', data);
        // Handle incoming ride request
      });

      wsService.onRideAccepted((data) => {
        console.log('Ride accepted:', data);
        // Update ride status
        setRides(prev => prev.map(ride => 
          ride._id === data.rideId 
            ? { ...ride, status: 'accepted', timestamps: { ...ride.timestamps, accepted: data.timestamp } }
            : ride
        ));
      });

      wsService.onRideRejected((data) => {
        console.log('Ride rejected:', data);
        // Handle ride rejection
      });

      wsService.onRideStatusChanged((data) => {
        console.log('Ride status changed:', data);
        // Update ride status
        setRides(prev => prev.map(ride => 
          ride._id === data.rideId 
            ? { ...ride, status: data.status }
            : ride
        ));
      });

      return () => {
        // Clean up listeners
        wsService.off('new_ride_request');
        wsService.off('ride_accepted');
        wsService.off('ride_rejected');
        wsService.off('ride_status_changed');
      };
    }
  }, [user]);

  return {
    rides,
    nearbyRides,
    isLoading,
    error,
    fetchRideHistory,
    fetchNearbyRides,
    createRide,
    joinRide,
    updateRideStatus,
    rateRide,
    clearError: () => setError(null),
  };
}