const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Mock rewards data (in production, this would come from a database)
const mockRewards = [
  {
    id: 'starbucks-coffee',
    title: 'Starbucks Coffee',
    description: 'Grande size any drink',
    category: 'food',
    cost: 50,
    originalPrice: '₹395',
    brand: 'Starbucks',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: true,
    terms: [
      'Valid at all Starbucks outlets in India',
      'Cannot be combined with other offers',
      'Valid for 30 days from redemption'
    ]
  },
  {
    id: 'nike-discount',
    title: 'Nike Sneakers',
    description: '25% off any sneaker',
    category: 'clothing',
    cost: 150,
    discount: '25% OFF',
    brand: 'Nike',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: true,
    terms: [
      'Valid at Nike stores and online',
      'Minimum purchase of ₹2000',
      'Valid for 60 days from redemption'
    ]
  },
  {
    id: 'airbnb-credit',
    title: 'Airbnb Credit',
    description: '₹2000 travel credit',
    category: 'travel',
    cost: 200,
    originalPrice: '₹2000',
    brand: 'Airbnb',
    image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: true,
    terms: [
      'Valid for bookings in India',
      'Minimum booking value ₹5000',
      'Valid for 90 days from redemption'
    ]
  },
  {
    id: 'zomato-voucher',
    title: 'Zomato Voucher',
    description: '₹300 food credit',
    category: 'food',
    cost: 30,
    originalPrice: '₹300',
    brand: 'Zomato',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: false,
    terms: [
      'Valid on Zomato app and website',
      'Minimum order value ₹500',
      'Valid for 45 days from redemption'
    ]
  },
  {
    id: 'uber-rides',
    title: 'Uber Rides',
    description: '₹500 ride credit',
    category: 'travel',
    cost: 75,
    originalPrice: '₹500',
    brand: 'Uber',
    image: 'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    featured: false,
    terms: [
      'Valid in all Indian cities',
      'Cannot be used for Uber Eats',
      'Valid for 30 days from redemption'
    ]
  }
];

// Get available rewards
router.get('/available', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let rewards = [...mockRewards];
    
    // Filter by category
    if (category && category !== 'all') {
      rewards = rewards.filter(reward => reward.category === category);
    }
    
    // Filter by featured
    if (featured === 'true') {
      rewards = rewards.filter(reward => reward.featured);
    }
    
    // Sort by cost (ascending)
    rewards.sort((a, b) => a.cost - b.cost);

    res.json({
      success: true,
      data: { rewards }
    });
  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific reward details
router.get('/:rewardId', async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    const reward = mockRewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    res.json({
      success: true,
      data: { reward }
    });
  } catch (error) {
    console.error('Get reward details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Redeem a reward
router.post('/:rewardId/redeem', async (req, res) => {
  try {
    const { rewardId } = req.params;
    const userId = req.user.userId;
    
    const reward = mockRewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    if (!reward.available) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not available'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has enough tokens
    if (user.tokens[reward.category] < reward.cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient tokens',
        data: {
          required: reward.cost,
          available: user.tokens[reward.category],
          shortfall: reward.cost - user.tokens[reward.category]
        }
      });
    }
    
    // Deduct tokens
    await user.deductTokens(reward.category, reward.cost);
    
    // Generate voucher code (in production, integrate with partner APIs)
    const voucherCode = generateVoucherCode();
    
    // Create redemption record (in production, save to database)
    const redemption = {
      id: `redemption_${Date.now()}`,
      userId,
      rewardId,
      voucherCode,
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'active'
    };
    
    // Send confirmation email/SMS (implement as needed)
    
    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        redemption,
        userTokens: user.tokens
      }
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's redemption history
router.get('/user/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    
    // In production, this would query a redemptions database
    // For now, return mock data
    const mockRedemptions = [
      {
        id: 'redemption_1',
        reward: mockRewards[0],
        voucherCode: 'HICUT-STAR-123456',
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'redemption_2',
        reward: mockRewards[3],
        voucherCode: 'HICUT-ZOMA-789012',
        redeemedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'expired'
      }
    ];

    res.json({
      success: true,
      data: {
        redemptions: mockRedemptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockRedemptions.length,
          pages: Math.ceil(mockRedemptions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get redemption history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get reward categories with token counts
router.get('/categories/summary', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('tokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const categories = [
      {
        category: 'food',
        balance: user.tokens.food,
        availableRewards: mockRewards.filter(r => r.category === 'food' && r.available).length,
        icon: 'coffee',
        color: '#FF6B35'
      },
      {
        category: 'travel',
        balance: user.tokens.travel,
        availableRewards: mockRewards.filter(r => r.category === 'travel' && r.available).length,
        icon: 'plane',
        color: '#4ECDC4'
      },
      {
        category: 'clothing',
        balance: user.tokens.clothing,
        availableRewards: mockRewards.filter(r => r.category === 'clothing' && r.available).length,
        icon: 'shirt',
        color: '#A8E6CF'
      },
      {
        category: 'coupons',
        balance: user.tokens.coupons,
        availableRewards: mockRewards.filter(r => r.category === 'coupons' && r.available).length,
        icon: 'tag',
        color: '#FFD93D'
      }
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to generate voucher codes
function generateVoucherCode() {
  const prefix = 'HICUT';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${random}-${timestamp}`;
}

module.exports = router;