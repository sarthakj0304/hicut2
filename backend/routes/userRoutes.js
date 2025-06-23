const express = require('express');
const User = require('../models/User');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user location
router.put('/location', async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const userId = req.user.userId;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        'location.current': {
          lat,
          lng,
          timestamp: new Date()
        },
        ...(address && { 'location.address': address })
      },
      { new: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get nearby users (drivers or riders)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 2000, role } = req.query;
    const currentUserId = req.user.userId;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const query = {
      _id: { $ne: currentUserId },
      isActive: true,
      'location.current.lat': { $exists: true },
      'location.current.lng': { $exists: true }
    };

    if (role) {
      query.$or = [
        { role: role },
        { role: 'both' }
      ];
    }

    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          spherical: true,
          query: query
        }
      },
      {
        $project: {
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.avatar': 1,
          'stats.rating': 1,
          'stats.totalRides': 1,
          'location.current': 1,
          role: 1,
          distance: 1
        }
      },
      {
        $limit: 20
      }
    ]);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user role
router.put('/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.userId;

    if (!['rider', 'driver', 'both'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be rider, driver, or both'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('stats tokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        stats: user.stats,
        tokens: user.tokens
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;