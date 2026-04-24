const mongoose = require('mongoose');

const villageScoreSchema = new mongoose.Schema({
  villageId: { type: String, required: true, unique: true },
  villageName: { type: String },
  state: { type: String },
  district: { type: String },
  population: { type: Number },
  healthScore: { type: Number, default: null },
  foodScore: { type: Number, default: null },
  educationScore: { type: Number, default: null },
  shelterScore: { type: Number, default: null },
  overallVulnerabilityScore: { type: Number, default: 0 },
  vulnerabilityClass: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'LOW' },
  primaryDomain: { type: String },
  domainsAvailable: [{ type: String }],
  householdsHealthSurveyed: { type: Number, default: 0 },
  householdsFoodSurveyed: { type: Number, default: 0 },
  householdsEducationSurveyed: { type: Number, default: 0 },
  householdsShelterSurveyed: { type: Number, default: 0 },
  computedAt: { type: Date, default: Date.now }
}, { timestamps: true });

villageScoreSchema.index({ overallVulnerabilityScore: -1 });

module.exports = mongoose.model('VillageScore', villageScoreSchema, 'villageScores');
