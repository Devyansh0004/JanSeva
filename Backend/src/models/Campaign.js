const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other', 'Multi-Domain Aid'],
      required: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    targetAmount: { type: Number, default: 0 },
    raisedAmount: { type: Number, default: 0 },
    volunteerTarget: { type: Number, default: 10 },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'Cancelled'],
      default: 'Active',
    },
    state: { type: String },
    city: { type: String },
    // Embedded summary for DBMS demo (embedding vs referencing)
    ngoSummary: {
      name: String,
      city: String,
      state: String,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ ngoId: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ startDate: -1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Campaign', campaignSchema);
