const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    village_id: { type: String, required: true },
    village_name: { type: String, required: true },
    domain: { type: String, required: true },
    priority_rank: { type: Number, required: true },
    domain_score: { type: Number, required: true },
    funds_assigned: { type: Number, default: 0 },
    volunteers_needed: { type: Number, required: true },
    volunteers_assigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ref to Volunteer user account
      },
    ],
    group_id: { type: String, required: true },
    group_rank_spread: [{ type: Number }], // Ranks of volunteers assigned
  },
  { timestamps: true }
);

assignmentSchema.index({ campaignId: 1 });
assignmentSchema.index({ domain: 1, priority_rank: 1 });
assignmentSchema.index({ village_id: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
