const VolunteerNGO = require('../models/VolunteerNGO');
const NGO = require('../models/NGO');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Volunteer requests to join an NGO
// @route   POST /api/volunteer-ngo/request
// @access  Private (Volunteer)
const requestToJoinNGO = asyncHandler(async (req, res, next) => {
  const { ngoId } = req.body;
  if (!ngoId) {
    return next(new AppError('NGO ID is required', 400));
  }

  const ngo = await NGO.findById(ngoId);
  if (!ngo) {
    return next(new AppError('NGO not found', 404));
  }

  // Check if already requested/joined
  const existing = await VolunteerNGO.findOne({ volunteerId: req.user._id, ngoId });
  if (existing) {
    return next(new AppError(`You already have a ${existing.status} request for this NGO`, 400));
  }

  const request = await VolunteerNGO.create({
    volunteerId: req.user._id,
    ngoId,
    status: 'pending'
  });

  sendSuccess(res, 201, 'Request sent successfully', request);
});

// @desc    Volunteer gets their NGOs (approved and pending)
// @route   GET /api/volunteer-ngo/my-ngos
// @access  Private (Volunteer)
const getMyNGOs = asyncHandler(async (req, res) => {
  const requests = await VolunteerNGO.find({ volunteerId: req.user._id })
    .populate('ngoId', 'name city state')
    .sort('-createdAt');
  
  sendSuccess(res, 200, 'Fetched my NGOs', requests);
});

// @desc    NGO gets pending volunteer requests
// @route   GET /api/volunteer-ngo/pending
// @access  Private (NGO)
const getPendingRequests = asyncHandler(async (req, res, next) => {
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    return next(new AppError('NGO profile not found', 404));
  }

  const requests = await VolunteerNGO.find({ ngoId: ngo._id, status: 'pending' })
    .populate('volunteerId', 'name email avatar')
    .sort('createdAt');

  sendSuccess(res, 200, 'Fetched pending requests', requests);
});

// @desc    NGO approves a volunteer request
// @route   PATCH /api/volunteer-ngo/:id/approve
// @access  Private (NGO)
const approveRequest = asyncHandler(async (req, res, next) => {
  const request = await VolunteerNGO.findById(req.params.id);
  if (!request) return next(new AppError('Request not found', 404));
  
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || request.ngoId.toString() !== ngo._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  request.status = 'approved';
  request.respondedAt = Date.now();
  await request.save();

  // Increment volunteer count for NGO
  ngo.volunteerCount += 1;
  await ngo.save();

  sendSuccess(res, 200, 'Request approved', request);
});

// @desc    NGO rejects a volunteer request
// @route   PATCH /api/volunteer-ngo/:id/reject
// @access  Private (NGO)
const rejectRequest = asyncHandler(async (req, res, next) => {
  const request = await VolunteerNGO.findById(req.params.id);
  if (!request) return next(new AppError('Request not found', 404));
  
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || request.ngoId.toString() !== ngo._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  request.status = 'rejected';
  request.respondedAt = Date.now();
  await request.save();

  sendSuccess(res, 200, 'Request rejected', request);
});

module.exports = {
  requestToJoinNGO,
  getMyNGOs,
  getPendingRequests,
  approveRequest,
  rejectRequest
};
