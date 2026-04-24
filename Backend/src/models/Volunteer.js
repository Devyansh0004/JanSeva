const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    age: {
      type: Number,
      min: 16,
    },
    domains: {
      type: [{
        type: String,
        enum: [
          'Education & Mentorship',
          'Healthcare & Wellness',
          'Food Security & Distribution',
          'Emergency & Disaster Response',
          'Shelter & Caregiving'
        ]
      }],
      default: [],
    },
    skills: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 20,
        message: 'Cannot have more than 20 skills',
      },
    },
    availability: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Weekends', 'On-call'],
      default: 'On-call',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    assignedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
      },
    ],
    completedRequests: {
      type: Number,
      default: 0,
    },
    surveysConducted: {
      type: Number,
      default: 0,
    },
    volunteeringHours: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    rank: {
      type: Number,
      default: null, // Computed periodically based on hours
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      city: String,
      state: String,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
volunteerSchema.index({ isAvailable: 1 });
volunteerSchema.index({ skills: 1 });
volunteerSchema.index({ skills: 1, isAvailable: 1 });                // compound: Feature 1
volunteerSchema.index({ 'location.state': 1, isAvailable: 1 });      // compound: Feature 1
volunteerSchema.index({ completedRequests: -1 });
volunteerSchema.index({ rating: -1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);
