const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Create a new ride request
router.post('/create', requireRole(['driver']), async (req, res) => {
  try {
    const {
      pickup,
      destination,
      scheduledTime,
      maxPassengers = 1,
      notes = ''
    } = req.body;

    const driverId = req.user.userId;

    // Validate required fields
    if (!pickup || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and destination are required'
      });
    }

    // Calculate route distance (simplified - in production use Google Maps API)
    const distance = calculateDistance(
      pickup.location.coordinates[1],
      pickup.location.coordinates[0],
      destination.location.coordinates[1],
      destination.location.coordinates[0]
    );

    // Estimate duration (simplified - 40 km/h average speed)
    const duration = Math.ceil((distance / 40) * 60); // in minutes

    // Calculate tokens
    const tokenAmount = Math.max(10, Math.ceil(distance * 3 + duration / 15 * 2));

    const ride = new Ride({
      driver: driverId,
      pickup,
      destination,
      route: {
        distance,
        duration
      },
      tokens: {
        amount: tokenAmount,
        category: 'food' // Default category, can be customized
      },
      scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
      maxPassengers,
      notes
    });

    await ride.save();
    await ride.populate('driver', 'profile.firstName profile.lastName profile.avatar stats.rating');

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get nearby rides for riders
router.get('/nearby', requireRole(['rider', 'both']), async (req, res) => {
  try {
    const { lat, lng, radius = 2000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const rides = await Ride.findNearbyRides(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius)
    );

    res.json({
      success: true,
      data: { rides }
    });
  } catch (error) {
    console.error('Get nearby rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Join a ride (for riders)
router.post('/:rideId/join', requireRole(['rider', 'both']), async (req, res) => {
  try {
    const { rideId } = req.params;
    const riderId = req.user.userId;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is not available'
      });
    }

    if (ride.rider) {
      return res.status(400).json({
        success: false,
        message: 'Ride already has a rider'
      });
    }

    if (ride.driver.toString() === riderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join your own ride'
      });
    }

    // Update ride with rider
    ride.rider = riderId;
    ride.status = 'accepted';
    ride.timestamps.accepted = new Date();
    await ride.save();

    await ride.populate([
      { path: 'driver', select: 'profile.firstName profile.lastName profile.avatar stats.rating' },
      { path: 'rider', select: 'profile.firstName profile.lastName profile.avatar stats.rating' }
    ]);

    res.json({
      success: true,
      message: 'Successfully joined the ride',
      data: { ride }
    });
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update ride status
router.put('/:rideId/status', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['accepted', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is part of this ride
    const isDriver = ride.driver.toString() === userId;
    const isRider = ride.rider && ride.rider.toString() === userId;
    
    if (!isDriver && !isRider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride'
      });
    }

    // Update ride status
    await ride.updateStatus(status, userId);

    // If ride is completed, distribute tokens
    if (status === 'completed' && !ride.tokens.distributed) {
      await distributeTokens(ride);
    }

    await ride.populate([
      { path: 'driver', select: 'profile.firstName profile.lastName profile.avatar stats.rating' },
      { path: 'rider', select: 'profile.firstName profile.lastName profile.avatar stats.rating' }
    ]);

    res.json({
      success: true,
      message: 'Ride status updated successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's ride history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      $or: [
        { driver: userId },
        { rider: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('driver', 'profile.firstName profile.lastName profile.avatar stats.rating')
      .populate('rider', 'profile.firstName profile.lastName profile.avatar stats.rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: {
        rides,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Rate a ride
router.post('/:rideId/rate', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, feedback = '' } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }

    const isDriver = ride.driver.toString() === userId;
    const isRider = ride.rider && ride.rider.toString() === userId;
    
    if (!isDriver && !isRider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this ride'
      });
    }

    // Add rating
    if (isDriver) {
      if (ride.rating.driverRating) {
        return res.status(400).json({
          success: false,
          message: 'Driver has already rated this ride'
        });
      }
      await ride.addRating('driver', rating, feedback);
      
      // Update rider's rating
      if (ride.rider) {
        const rider = await User.findById(ride.rider);
        await rider.updateRating(rating);
      }
    } else {
      if (ride.rating.riderRating) {
        return res.status(400).json({
          success: false,
          message: 'Rider has already rated this ride'
        });
      }
      await ride.addRating('rider', rating, feedback);
      
      // Update driver's rating
      const driver = await User.findById(ride.driver);
      await driver.updateRating(rating);
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Rate ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Helper function to distribute tokens after ride completion
async function distributeTokens(ride) {
  try {
    const tokenAmount = ride.tokens.amount;
    const category = ride.tokens.category;
    
    // Give tokens to both driver and rider
    if (ride.driver) {
      const driver = await User.findById(ride.driver);
      await driver.addTokens(category, tokenAmount);
      driver.stats.completedRides += 1;
      driver.stats.totalRides += 1;
      await driver.save();
    }
    
    if (ride.rider) {
      const rider = await User.findById(ride.rider);
      await rider.addTokens(category, tokenAmount);
      rider.stats.completedRides += 1;
      rider.stats.totalRides += 1;
      await rider.save();
    }
    
    // Mark tokens as distributed
    ride.tokens.distributed = true;
    await ride.save();
    
    console.log(`Tokens distributed for ride ${ride._id}: ${tokenAmount} ${category} tokens each`);
  } catch (error) {
    console.error('Token distribution error:', error);
  }
}

module.exports = router;