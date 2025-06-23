const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Vehicle Details
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Vehicle Type
  type: {
    type: String,
    enum: ['sedan', 'hatchback', 'suv', 'motorcycle', 'auto-rickshaw'],
    required: true
  },

  // Capacity
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },

  // Insurance Information
  insurance: {
    provider: {
      type: String,
      required: true,
      trim: true
    },
    policyNumber: {
      type: String,
      required: true,
      trim: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Registration Information
  registration: {
    number: {
      type: String,
      required: true,
      trim: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['registration', 'insurance', 'pollution-certificate', 'permit'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  }],

  // Vehicle Photos
  photos: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['front', 'back', 'side', 'interior'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification Status
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },

  // Vehicle Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Features
  features: [{
    type: String,
    enum: ['ac', 'music-system', 'gps', 'phone-charger', 'wifi']
  }],

  // Maintenance
  lastService: {
    type: Date,
    default: null
  },
  nextService: {
    type: Date,
    default: null
  },

  // Usage Statistics
  stats: {
    totalRides: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ 'verification.status': 1 });
vehicleSchema.index({ isActive: 1 });

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for insurance validity
vehicleSchema.virtual('insuranceValid').get(function() {
  return this.insurance.expiryDate > new Date();
});

// Virtual for registration validity
vehicleSchema.virtual('registrationValid').get(function() {
  return this.registration.expiryDate > new Date();
});

// Method to update rating
vehicleSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.stats.rating * this.stats.ratingCount) + newRating;
  this.stats.ratingCount += 1;
  this.stats.rating = totalRating / this.stats.ratingCount;
  return this.save();
};

// Method to verify vehicle
vehicleSchema.methods.verify = function(verifiedBy, approved = true, reason = '') {
  this.verification.status = approved ? 'approved' : 'rejected';
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  if (!approved) {
    this.verification.rejectionReason = reason;
  }
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);