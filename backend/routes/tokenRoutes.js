const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get user's token balance
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('tokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { tokens: user.tokens }
    });
  } catch (error) {
    console.error('Get token balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add tokens (admin only - for testing)
router.post('/add', async (req, res) => {
  try {
    const { category, amount } = req.body;
    const userId = req.user.userId;

    if (!['food', 'travel', 'clothing', 'coupons'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token category'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(userId);
    await user.addTokens(category, amount);

    res.json({
      success: true,
      message: 'Tokens added successfully',
      data: { tokens: user.tokens }
    });
  } catch (error) {
    console.error('Add tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Transfer tokens between categories
router.post('/transfer', async (req, res) => {
  try {
    const { fromCategory, toCategory, amount } = req.body;
    const userId = req.user.userId;

    const validCategories = ['food', 'travel', 'clothing', 'coupons'];
    
    if (!validCategories.includes(fromCategory) || !validCategories.includes(toCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token category'
      });
    }

    if (fromCategory === toCategory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same category'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(userId);
    
    if (user.tokens[fromCategory] < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient tokens'
      });
    }

    // Deduct from source category
    await user.deductTokens(fromCategory, amount);
    
    // Add to destination category
    await user.addTokens(toCategory, amount);

    res.json({
      success: true,
      message: 'Tokens transferred successfully',
      data: { tokens: user.tokens }
    });
  } catch (error) {
    console.error('Transfer tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get token transaction history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    // This would typically come from a separate TokenTransaction model
    // For now, we'll return ride-based token earnings
    const Ride = require('../models/Ride');
    
    const rides = await Ride.find({
      $or: [{ driver: userId }, { rider: userId }],
      status: 'completed',
      'tokens.distributed': true
    })
    .select('tokens createdAt timestamps.completed')
    .sort({ 'timestamps.completed': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const transactions = rides.map(ride => ({
      id: ride._id,
      type: 'earned',
      category: ride.tokens.category,
      amount: ride.tokens.amount,
      description: 'Ride completion reward',
      date: ride.timestamps.completed
    }));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: rides.length
        }
      }
    });
  } catch (error) {
    console.error('Get token history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;