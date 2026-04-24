const mongoose = require('mongoose');

const surveyUploadSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  sessionId: { type: String, required: true },
  surveyType: { type: String, enum: ['food', 'health', 'education', 'shelter', 'emergency'], required: true },
  filename: { type: String, required: true },
  villagesIncluded: [{ type: String }],
  rowCount: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'processed', 'failed'], default: 'processing' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyUpload', surveyUploadSchema, 'surveyuploads');
