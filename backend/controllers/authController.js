const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      role = 'rider',
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or phone number',
      });
    }

    // Create new user
    const user = new User({
      email,
      phone,
      password,
      role,
      profile: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
      },
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Send welcome email (optional)
    try {
      await sendEmail(
        email,
        'Welcome to HICUT!',
        `Hi ${firstName}, welcome to the HICUT community! Start earning tokens by sharing rides.`
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Extract device info from request
    const deviceInfo = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      platform: req.headers['x-platform'] || 'web',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
    };

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account is banned. Reason: ${
          user.banReason || 'Violation of terms'
        }`,
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await user.logLoginAttempt(
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        deviceInfo.platform,
        false
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token with device info
    await user.addRefreshToken(refreshToken, deviceInfo);

    // Log successful login
    await user.logLoginAttempt(
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
      deviceInfo.platform,
      true
    );

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.loginHistory;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 24 * 60 * 60, // 24 hours in seconds
        },
        deviceInfo: {
          platform: deviceInfo.platform,
          loginTime: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const tokenExists = user.refreshTokens.some(
      (t) => t.token === refreshToken
    );
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (refreshToken) {
      // Remove specific refresh token
      await user.removeRefreshToken(refreshToken);
    } else {
      // Remove all refresh tokens (logout from all devices)
      await user.clearAllRefreshTokens();
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get user's login history
exports.getLoginHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId).select('loginHistory');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Sort by timestamp descending and paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = user.loginHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        loginHistory: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: user.loginHistory.length,
          pages: Math.ceil(user.loginHistory.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get active sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('refreshTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Format active sessions
    const activeSessions = user.refreshTokens.map((tokenData) => ({
      id: tokenData._id,
      platform: tokenData.deviceInfo?.platform || 'Unknown',
      userAgent: tokenData.deviceInfo?.userAgent || 'Unknown',
      ipAddress: tokenData.deviceInfo?.ipAddress || 'Unknown',
      createdAt: tokenData.createdAt,
      isCurrentSession: req.headers.authorization?.includes(tokenData.token),
    }));

    res.json({
      success: true,
      data: { activeSessions },
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Revoke specific session
exports.revokeSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find and remove the specific refresh token
    const tokenToRemove = user.refreshTokens.find(
      (t) => t._id.toString() === sessionId
    );
    if (!tokenToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await user.removeRefreshToken(tokenToRemove.token);

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Send OTP for phone verification
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in user document (in production, use Redis for better performance)
    await User.findByIdAndUpdate(userId, {
      'verification.phoneOTP': otp,
      'verification.phoneOTPExpiry': new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send SMS
    try {
      await sendSMS(
        phone,
        `Your HICUT verification code is: ${otp}. Valid for 10 minutes.`
      );
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify phone OTP
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check OTP
    if (!user.verification.phoneOTP || user.verification.phoneOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check OTP expiry
    if (user.verification.phoneOTPExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark phone as verified
    user.verification.phone = true;
    user.verification.phoneOTP = undefined;
    user.verification.phoneOTPExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    console.log(updates);

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.phone;
    delete updates.verification;
    delete updates.tokens;
    delete updates.stats;

    const mappedUpdates = {};
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    // Handle profile fields
    if (updates.name) {
      const [firstName, ...lastNameParts] = updates.name.split(' ');
      user.profile.firstName = firstName;
      user.profile.lastName = lastNameParts.join(' ');
    }
    // Direct mappings
    if (updates.bio !== undefined) user.profile.bio = updates.bio;
    if (updates.location !== undefined) user.location = updates.location;
    if (updates.phone !== undefined) user.phone = updates.phone;

    // Save the document
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
