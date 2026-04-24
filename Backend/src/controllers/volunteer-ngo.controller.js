const VolunteerNGO = require('../models/VolunteerNGO');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
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

// @desc    NGO gets approved volunteers
// @route   GET /api/volunteer-ngo/approved
// @access  Private (NGO)
const getApprovedVolunteers = asyncHandler(async (req, res, next) => {
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    return next(new AppError('NGO profile not found', 404));
  }

  const approved = await VolunteerNGO.find({ ngoId: ngo._id, status: 'approved' })
    .populate('volunteerId', 'name email avatar')
    .sort('-respondedAt');
  
  // Filter out orphaned requests where the user might have been deleted
  const validApproved = approved.filter(req => req.volunteerId);
  const volunteerUserIds = validApproved.map(req => req.volunteerId._id);
  const volunteerProfiles = await Volunteer.find({ userId: { $in: volunteerUserIds } }).lean();
  
  // Map profiles to requests
  const responseData = validApproved.map(request => {
    const profile = volunteerProfiles.find(p => p.userId.toString() === request.volunteerId._id.toString());
    return {
      _id: request._id,
      volunteerId: request.volunteerId,
      status: request.status,
      respondedAt: request.respondedAt,
      volunteeringHours: profile ? profile.volunteeringHours : 0
    };
  });

  sendSuccess(res, 200, 'Fetched approved volunteers', responseData);
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

// @desc    NGO assigns hours to a volunteer
// @route   POST /api/volunteer-ngo/:volunteerId/assign-hours
// @access  Private (NGO)
const assignHours = asyncHandler(async (req, res, next) => {
  const { hours } = req.body;
  if (!hours || isNaN(hours) || Number(hours) <= 0) {
    return next(new AppError('Please provide a valid number of hours', 400));
  }

  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) return next(new AppError('NGO profile not found', 404));

  // Verify that the volunteer is actually approved for this NGO
  const relation = await VolunteerNGO.findOne({
    ngoId: ngo._id,
    volunteerId: req.params.volunteerId,
    status: 'approved'
  });

  if (!relation) {
    return next(new AppError('You can only assign hours to approved volunteers', 403));
  }

  // Find the Volunteer profile using the userId explicitly
  const volunteerProfile = await Volunteer.findOne({ userId: req.params.volunteerId });
  if (!volunteerProfile) {
    return next(new AppError('Volunteer profile not found', 404));
  }

  volunteerProfile.volunteeringHours += Number(hours);
  await volunteerProfile.save();

  sendSuccess(res, 200, `Successfully assigned ${hours} hours to volunteer`, {
    volunteeringHours: volunteerProfile.volunteeringHours
  });
});

// @desc    NGO removes/deassigns a volunteer
// @route   DELETE /api/volunteer-ngo/:id
// @access  Private (NGO)
const removeVolunteer = asyncHandler(async (req, res, next) => {
  const request = await VolunteerNGO.findById(req.params.id);
  if (!request) return next(new AppError('Affiliation record not found', 404));

  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || request.ngoId.toString() !== ngo._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  await VolunteerNGO.findByIdAndDelete(req.params.id);

  // Decrement volunteer count for NGO
  if (ngo.volunteerCount > 0) {
    ngo.volunteerCount -= 1;
    await ngo.save();
  }

  sendSuccess(res, 200, 'Volunteer removed from your NGO successfully');
});

module.exports = {
  requestToJoinNGO,
  getMyNGOs,
  getPendingRequests,
  getApprovedVolunteers,
  approveRequest,
  rejectRequest,
  assignHours,
  removeVolunteer
};
