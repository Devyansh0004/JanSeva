const mongoose = require('mongoose');

const skillWeightSchema = new mongoose.Schema({
  skill: { type: String, required: true, unique: true },
  weight: { type: Number, required: true, min: 0, max: 1 },
  tier: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  description: { type: String }
});

module.exports = mongoose.model('SkillWeight', skillWeightSchema, 'skillweights');
