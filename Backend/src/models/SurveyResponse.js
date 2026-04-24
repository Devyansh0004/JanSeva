const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'SurveyUpload' },
  surveyType: { type: String, enum: ['food', 'health', 'education', 'shelter', 'emergency'], required: true },
  villageId: { type: String, required: true },
  villageName: { type: String },
  householdId: { type: String },
  surveyorId: { type: String },
  surveyDate: { type: Date },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

surveyResponseSchema.index({ villageId: 1, surveyType: 1 });
surveyResponseSchema.index({ sessionId: 1 });

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema, 'surveyresponses');
