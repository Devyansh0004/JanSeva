const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Cancelled'],
      default: 'Pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    ngoHandling: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    tags: [String],
    beneficiaryCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ 'location.city': 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ createdBy: 1 });
serviceRequestSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

// ─── Pre-save: Set resolvedAt when status becomes Resolved ───────────────────
serviceRequestSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
