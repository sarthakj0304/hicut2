const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Profile Information
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      avatar: {
        type: String,
        default: null,
      },
      dateOfBirth: {
        type: Date,
        required: true,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        required: true,
      },
      bio: {
        type: String,
        maxlength: 500,
        default: '',
      },
    },

    // Role Management
    role: {
      type: String,
      enum: ['rider', 'driver', 'both'],
      default: 'rider',
    },

    // Verification Status
    verification: {
      email: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: Boolean,
        default: false,
      },
      identity: {
        type: Boolean,
        default: false,
      },
      driverLicense: {
        type: Boolean,
        default: false,
      },
      backgroundCheck: {
        type: Boolean,
        default: false,
      },
    },

    // Location Information
    location: {
      current: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [lng, lat]
          default: [0, 0],
        },
        timestamp: {
          type: Date,
          default: null,
        },
      },
      address: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
      country: {
        type: String,
        default: 'India',
      },
    },

    // Token Wallet
    tokens: {
      food: {
        type: Number,
        default: 0,
        min: 0,
      },
      travel: {
        type: Number,
        default: 0,
        min: 0,
      },
      clothing: {
        type: Number,
        default: 0,
        min: 0,
      },
      coupons: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // User Statistics
    stats: {
      totalRides: {
        type: Number,
        default: 0,
        min: 0,
      },
      completedRides: {
        type: Number,
        default: 0,
        min: 0,
      },
      cancelledRides: {
        type: Number,
        default: 0,
        min: 0,
      },
      rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5,
      },
      ratingCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      trustScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      carbonSaved: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Account Settings
    settings: {
      notifications: {
        push: {
          type: Boolean,
          default: true,
        },
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      privacy: {
        shareLocation: {
          type: Boolean,
          default: true,
        },
        shareProfile: {
          type: Boolean,
          default: true,
        },
      },
    },

    // Security
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800, // 7 days
        },
      },
    ],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },

    // Timestamps
    lastLogin: {
      type: Date,
      default: null,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });
userSchema.index({ 'location.current': '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for completion percentage
userSchema.virtual('profileCompletion').get(function () {
  let completed = 0;
  let total = 8;

  if (this.profile.firstName) completed++;
  if (this.profile.lastName) completed++;
  if (this.profile.avatar) completed++;
  if (this.profile.dateOfBirth) completed++;
  if (this.profile.bio) completed++;
  if (this.verification.email) completed++;
  if (this.verification.phone) completed++;
  if (this.verification.identity) completed++;

  return Math.round((completed / total) * 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update total tokens
userSchema.pre('save', function (next) {
  this.tokens.total =
    this.tokens.food +
    this.tokens.travel +
    this.tokens.clothing +
    this.tokens.coupons;
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update location
userSchema.methods.updateLocation = function (lat, lng, address = '') {
  this.location.current.coordinates = [lng, lat]; // GeoJSON requires [lng, lat]
  this.location.current.timestamp = new Date();
  if (address) {
    this.location.address = address;
  }
  return this.save();
};

// Method to add tokens
userSchema.methods.addTokens = function (category, amount) {
  if (!['food', 'travel', 'clothing', 'coupons'].includes(category)) {
    throw new Error('Invalid token category');
  }
  this.tokens[category] += amount;
  return this.save();
};

// Method to deduct tokens
userSchema.methods.deductTokens = function (category, amount) {
  if (!['food', 'travel', 'clothing', 'coupons'].includes(category)) {
    throw new Error('Invalid token category');
  }
  if (this.tokens[category] < amount) {
    throw new Error('Insufficient tokens');
  }
  this.tokens[category] -= amount;
  return this.save();
};

// Method to update rating
userSchema.methods.updateRating = function (newRating) {
  const totalRating = this.stats.rating * this.stats.ratingCount + newRating;
  this.stats.ratingCount += 1;
  this.stats.rating = totalRating / this.stats.ratingCount;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
