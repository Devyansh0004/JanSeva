const mongoose = require('mongoose');

const campaignRegistrationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'matched', 'rejected'],
      default: 'registered',
    },
    matchScore: {
      type: Number,
      default: null,
    },
    assignedVillageId: {
      type: String, // String since village_id is string
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

campaignRegistrationSchema.index({ campaignId: 1, volunteerId: 1 }, { unique: true });
campaignRegistrationSchema.index({ campaignId: 1, status: 1 });
campaignRegistrationSchema.index({ campaignId: 1, matchScore: -1 });

module.exports = mongoose.model('CampaignRegistration', campaignRegistrationSchema);
