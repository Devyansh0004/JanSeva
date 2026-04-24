const mongoose = require('mongoose');

const columnWeightSchema = new mongoose.Schema({
  surveyType: { type: String, required: true, enum: ['food', 'health', 'education', 'shelter', 'emergency'] },
  column: { type: String, required: true },
  weight: { type: Number, required: true },
  direction: { type: String, enum: ['positive', 'inverse'], required: true },
  learnedAt: { type: Date, default: Date.now }
});

columnWeightSchema.index({ surveyType: 1, column: 1 }, { unique: true });

module.exports = mongoose.model('ColumnWeight', columnWeightSchema, 'columnweights');
