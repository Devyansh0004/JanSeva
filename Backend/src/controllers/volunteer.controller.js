const ServiceRequest = require('../models/ServiceRequest');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ─── @route  POST /api/volunteer/assign ──────────────────────────────────────
// ─── @access Private (admin, ngo)
const assignVolunteer = asyncHandler(async (req, res, next) => {
  const { requestId, volunteerId } = req.body;

  // Validate service request exists
  const request = await ServiceRequest.findById(requestId);
  if (!request) return next(new AppError('Service request not found.', 404));

  if (request.status === 'Resolved' || request.status === 'Cancelled') {
    return next(new AppError(`Cannot assign to a ${request.status} request.`, 400));
  }

  // Validate volunteer user exists and has correct role
  const volunteerUser = await User.findById(volunteerId);
  if (!volunteerUser) return next(new AppError('Volunteer user not found.', 404));
  if (volunteerUser.role !== 'volunteer') {
    return next(new AppError('User is not a volunteer.', 400));
  }

  // Prevent duplicate assignment
  const alreadyAssigned = request.assignedVolunteers.some(
    (id) => id.toString() === volunteerId.toString()
  );
  if (alreadyAssigned) {
    return next(new AppError('Volunteer is already assigned to this request.', 409));
  }

  // Assign volunteer and update status
  request.assignedVolunteers.push(volunteerId);
  if (request.status === 'Pending') {
    request.status = 'In Progress';
  }
  await request.save();

  // Update volunteer's assignedRequests
  await Volunteer.findOneAndUpdate(
    { userId: volunteerId },
    { $addToSet: { assignedRequests: requestId }, isAvailable: false },
    { upsert: true, new: true }
  );

  const populated = await ServiceRequest.findById(requestId)
    .populate('assignedVolunteers', 'name email')
    .populate('createdBy', 'name email');

  logger.info(
    `Volunteer ${volunteerId} assigned to request ${requestId} by ${req.user.email}`
  );
  sendSuccess(res, 200, 'Volunteer assigned successfully', populated);
});

// ─── @route  POST /api/volunteer/unassign ────────────────────────────────────
// ─── @access Private (admin, ngo)
const unassignVolunteer = asyncHandler(async (req, res, next) => {
  const { requestId, volunteerId } = req.body;

  const request = await ServiceRequest.findById(requestId);
  if (!request) return next(new AppError('Service request not found.', 404));

  const wasAssigned = request.assignedVolunteers.some(
    (id) => id.toString() === volunteerId.toString()
  );
  if (!wasAssigned) {
    return next(new AppError('Volunteer is not assigned to this request.', 400));
  }

  // Remove volunteer
  request.assignedVolunteers = request.assignedVolunteers.filter(
    (id) => id.toString() !== volunteerId.toString()
  );

  // If no more volunteers, revert to Pending
  if (request.assignedVolunteers.length === 0 && request.status === 'In Progress') {
    request.status = 'Pending';
  }
  await request.save();

  // Remove from volunteer's assignments
  await Volunteer.findOneAndUpdate(
    { userId: volunteerId },
    { $pull: { assignedRequests: requestId } }
  );

  logger.info(`Volunteer ${volunteerId} removed from request ${requestId}`);
  sendSuccess(res, 200, 'Volunteer unassigned successfully');
});

// ─── @route  GET /api/volunteer/profile ──────────────────────────────────────
// ─── @access Private (volunteer)
const getMyVolunteerProfile = asyncHandler(async (req, res, next) => {
  const profile = await Volunteer.findOne({ userId: req.user._id })
    .populate('userId', 'name email')
    .populate('assignedRequests', 'title status category priority');

  if (!profile) return next(new AppError('Volunteer profile not found.', 404));
  sendSuccess(res, 200, 'Volunteer profile fetched', profile);
});

// ─── @route  PUT /api/volunteer/profile ──────────────────────────────────────
// ─── @access Private (volunteer)
const updateVolunteerProfile = asyncHandler(async (req, res, next) => {
  const allowed = ['skills', 'availability', 'isAvailable', 'bio', 'location', 'age', 'gender', 'domains'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await Volunteer.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!profile) return next(new AppError('Volunteer profile not found.', 404));
  sendSuccess(res, 200, 'Volunteer profile updated', profile);
});

// ─── @route  GET /api/volunteer/all ──────────────────────────────────────────
// ─── @access Private (admin, ngo)
const getAllVolunteers = asyncHandler(async (req, res) => {
  const { available, skills, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (available !== undefined) filter.isAvailable = available === 'true';
  if (skills) filter.skills = { $in: skills.split(',') };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [volunteers, total] = await Promise.all([
    Volunteer.find(filter)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limitNum),
    Volunteer.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Volunteers fetched', volunteers, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

module.exports = {
  assignVolunteer,
  unassignVolunteer,
  getMyVolunteerProfile,
  updateVolunteerProfile,
  getAllVolunteers,
};
