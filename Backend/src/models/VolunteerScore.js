const mongoose = require('mongoose');

const volunteerScoreSchema = new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillScore: { type: Number, default: 0 },
  experienceScore: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 0 },
  availabilityScore: { type: Number, default: 0 },
  domainDepthScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  tier: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'D' },
  percentileRank: { type: Number, default: 0 },
  computedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('VolunteerScore', volunteerScoreSchema, 'volunteerscores');
