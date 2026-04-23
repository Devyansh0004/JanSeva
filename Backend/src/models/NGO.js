const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
      maxlength: [100, 'NGO name cannot exceed 100 characters'],
    },
    organizationDetails: {
      type: String,
      required: [true, 'Organization details are required'],
      trim: true,
      maxlength: [2000, 'Organization details cannot exceed 2000 characters'],
    },
    registrationNumber: { type: String, trim: true, sparse: true },
    contactInfo: {
      phone: { type: String, trim: true, match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'] },
      website: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    focusAreas: {
      type: [String],
      enum: ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'],
    },
    // ─── Geographic fields ────────────────────────────────────────────────────
    state: { type: String, trim: true, index: true },
    city: { type: String, trim: true },
    // Simple coordinates for map display
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    // GeoJSON Point for $near / $geoNear queries (2dsphere index)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat] — GeoJSON order!
    },
    // ─── Analytics fields ─────────────────────────────────────────────────────
    volunteerCount: { type: Number, default: 0, min: 0 },
    contributionLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    totalContributions: { type: Number, default: 0, min: 0 },
    registeredRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }],
    isVerified: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    impactScore: { type: Number, default: 0 },
    foundedYear: { type: Number },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
ngoSchema.index({ isVerified: 1 });
ngoSchema.index({ name: 'text', organizationDetails: 'text', city: 'text', state: 'text' });
ngoSchema.index({ state: 1, focusAreas: 1 }); // Compound index
ngoSchema.index({ contributionLevel: 1 });
ngoSchema.index({ impactScore: -1 });
ngoSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
ngoSchema.index({ location: '2dsphere' }); // GeoJSON 2dsphere for $near queries

module.exports = mongoose.model('NGO', ngoSchema);
