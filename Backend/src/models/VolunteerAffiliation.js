const mongoose = require('mongoose');

const volunteerAffiliationSchema = new mongoose.Schema(
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
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests
volunteerAffiliationSchema.index({ volunteerId: 1, ngoId: 1 }, { unique: true });
volunteerAffiliationSchema.index({ ngoId: 1, status: 1 });

module.exports = mongoose.model('VolunteerAffiliation', volunteerAffiliationSchema);
