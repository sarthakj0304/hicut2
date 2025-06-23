const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  // Participants
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Ride Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Location Information
  pickup: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    landmark: {
      type: String,
      default: ''
    }
  },

  destination: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    landmark: {
      type: String,
      default: ''
    }
  },

  // Route Information
  route: {
    distance: {
      type: Number, // in kilometers
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    polyline: {
      type: String,
      default: ''
    }
  },

  // Token Information
  tokens: {
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      enum: ['food', 'travel', 'clothing', 'coupons'],
      required: true
    },
    distributed: {
      type: Boolean,
      default: false
    }
  },

  // Timing
  scheduledTime: {
    type: Date,
    default: Date.now
  },
  
  timestamps: {
    requested: {
      type: Date,
      default: Date.now
    },
    accepted: {
      type: Date,
      default: null
    },
    started: {
      type: Date,
      default: null
    },
    completed: {
      type: Date,
      default: null
    },
    cancelled: {
      type: Date,
      default: null
    }
  },

  // Ratings and Feedback
  rating: {
    driverRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    riderRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    driverFeedback: {
      type: String,
      maxlength: 500,
      default: ''
    },
    riderFeedback: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },

  // Additional Information
  notes: {
    type: String,
    maxlength: 200,
    default: ''
  },
  
  maxPassengers: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },

  // Safety Features
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },

  // Cancellation Information
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'destination.location': '2dsphere' });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ rider: 1, status: 1 });
rideSchema.index({ status: 1, scheduledTime: 1 });
rideSchema.index({ createdAt: -1 });

// Virtual for ride duration
rideSchema.virtual('actualDuration').get(function() {
  if (this.timestamps.completed && this.timestamps.started) {
    return Math.round((this.timestamps.completed - this.timestamps.started) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for ride cost calculation
rideSchema.virtual('estimatedCost').get(function() {
  // Base cost: 5 tokens per km + 2 tokens per 10 minutes
  const distanceCost = Math.ceil(this.route.distance * 5);
  const timeCost = Math.ceil(this.route.duration / 10) * 2;
  return Math.max(distanceCost + timeCost, 10); // Minimum 10 tokens
});

// Method to calculate tokens based on distance and time
rideSchema.methods.calculateTokens = function() {
  const baseTokens = 10;
  const distanceTokens = Math.ceil(this.route.distance * 3); // 3 tokens per km
  const timeTokens = Math.ceil(this.route.duration / 15) * 2; // 2 tokens per 15 minutes
  
  return Math.max(baseTokens, distanceTokens + timeTokens);
};

// Method to update ride status
rideSchema.methods.updateStatus = function(newStatus, userId = null) {
  const now = new Date();
  
  this.status = newStatus;
  
  switch (newStatus) {
    case 'accepted':
      this.timestamps.accepted = now;
      break;
    case 'in-progress':
      this.timestamps.started = now;
      break;
    case 'completed':
      this.timestamps.completed = now;
      break;
    case 'cancelled':
      this.timestamps.cancelled = now;
      if (userId) {
        this.cancellation.cancelledBy = userId;
        this.cancellation.timestamp = now;
      }
      break;
  }
  
  return this.save();
};

// Method to add rating
rideSchema.methods.addRating = function(ratingType, rating, feedback = '') {
  if (ratingType === 'driver') {
    this.rating.driverRating = rating;
    this.rating.driverFeedback = feedback;
  } else if (ratingType === 'rider') {
    this.rating.riderRating = rating;
    this.rating.riderFeedback = feedback;
  }
  
  return this.save();
};

// Static method to find nearby rides
rideSchema.statics.findNearbyRides = function(lat, lng, maxDistance = 2000) {
  return this.find({
    status: 'pending',
    'pickup.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  }).populate('driver', 'profile.firstName profile.lastName profile.avatar stats.rating');
};

module.exports = mongoose.model('Ride', rideSchema);