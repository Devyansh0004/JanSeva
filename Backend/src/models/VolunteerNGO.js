const mongoose = require('mongoose');

const volunteerNGOSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

volunteerNGOSchema.index({ volunteerId: 1, ngoId: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerNGO', volunteerNGOSchema);
