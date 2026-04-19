const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
      maxlength: [100, 'NGO name cannot exceed 100 characters'],
    },
    organizationDetails: {
      type: String,
      required: [true, 'Organization details are required'],
      trim: true,
      maxlength: [2000, 'Organization details cannot exceed 2000 characters'],
    },
    registrationNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    focusAreas: {
      type: [String],
      enum: ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'],
    },
    registeredRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    impactScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
ngoSchema.index({ userId: 1 });
ngoSchema.index({ isVerified: 1 });
ngoSchema.index({ name: 'text' });

module.exports = mongoose.model('NGO', ngoSchema);
