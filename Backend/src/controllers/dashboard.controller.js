const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Campaign = require('../models/Campaign');
const VolunteerAffiliation = require('../models/VolunteerAffiliation');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ─── GET /api/dashboard/volunteer
const getVolunteerDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') throw new AppError('Unauthorized', 403);
  
  const volunteerRecord = await Volunteer.findOne({ userId: req.user._id }).lean() || {};
  
  // Affiliations
  const affiliations = await VolunteerAffiliation.find({ volunteerId: req.user._id })
    .populate('ngoId', 'name city state contributionLevel isVerified')
    .sort({ createdAt: -1 })
    .lean();
    
  // Up coming campaigns
  const upcomingEvents = await Campaign.find({
    status: { $in: ['Upcoming', 'Active'] }
  })
    .sort({ isEmergency: -1, startDate: 1 })
    .limit(20)
    .lean();
    
  // Format to see if user is registered for any
  const eventsWithRegStatus = upcomingEvents.map(e => ({
    ...e,
    isRegistered: e.volunteers && e.volunteers.map(v => v.toString()).includes(req.user._id.toString())
  }));

  sendSuccess(res, 200, 'Volunteer dashboard data fetched', {
    metrics: {
      hours: volunteerRecord.volunteeringHours || 0,
      surveys: volunteerRecord.surveysConducted || 0,
    },
    affiliations,
    events: eventsWithRegStatus,
  });
});

// ─── GET /api/dashboard/ngo
const getNgoDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ngo') throw new AppError('Unauthorized', 403);
  
  let ngo = await NGO.findOne({ userId: req.user._id }).lean();
  
  // If user registered as NGO but database NGO representation is missing, auto-create it:
  if (!ngo) {
    const createdNgo = await NGO.create({ 
      userId: req.user._id, 
      name: req.user.name, 
      organizationDetails: 'Pending organization details setup.', 
      location: { type: 'Point', coordinates: [78.9629, 20.5937] },
      isVerified: false 
    });
    ngo = await NGO.findById(createdNgo._id).lean();
  }
  
  // Pending Volunteer Requests
  const pendingRequests = await VolunteerAffiliation.find({ ngoId: ngo._id, status: 'Pending' })
    .populate('volunteerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
    
  // Approved Volunteers
  const approvedVolunteers = await VolunteerAffiliation.find({ ngoId: ngo._id, status: 'Approved' })
    .populate('volunteerId', 'name email')
    .lean();

  sendSuccess(res, 200, 'NGO dashboard data fetched', {
    ngo,
    pendingRequests,
    approvedVolunteers
  });
});

// ─── GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new AppError('Unauthorized', 403);
  
  const unverifiedNGOs = await NGO.find({ isVerified: false })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
    
  const verifiedNGOs = await NGO.find({ isVerified: true })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  sendSuccess(res, 200, 'Admin dashboard data fetched', {
    unverifiedNGOs,
    verifiedNGOs
  });
});

// ─── UTILITY ROUTES FOR DASHBOARD ACTIONS ───

const requestNgoAffiliation = asyncHandler(async (req, res) => {
  const { ngoId } = req.body;
  if (!ngoId) throw new AppError('NGO ID required', 400);

  const existing = await VolunteerAffiliation.findOne({ volunteerId: req.user._id, ngoId });
  if (existing) throw new AppError('Request already exists', 400);

  await VolunteerAffiliation.create({ volunteerId: req.user._id, ngoId, status: 'Pending' });
  sendSuccess(res, 201, 'Request sent to NGO');
});

const respondToAffiliation = asyncHandler(async (req, res) => {
  const { requestId, status } = req.body; // status: 'Approved', 'Rejected'
  if (!['Approved', 'Rejected'].includes(status)) throw new AppError('Invalid status', 400);

  const affiliation = await VolunteerAffiliation.findById(requestId);
  if (!affiliation) throw new AppError('Request not found', 404);
  
  // Verify this NGO owns the request
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== affiliation.ngoId.toString()) {
    throw new AppError('Unauthorized', 403);
  }

  affiliation.status = status;
  await affiliation.save();
  
  sendSuccess(res, 200, `Request ${status.toLowerCase()} successfully`);
});

const removeAffiliation = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ngo') throw new AppError('Unauthorized', 403);
  const { id } = req.params;

  const affiliation = await VolunteerAffiliation.findById(id);
  if (!affiliation) throw new AppError('Request not found', 404);

  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== affiliation.ngoId.toString()) {
    throw new AppError('Unauthorized', 403);
  }

  await VolunteerAffiliation.findByIdAndDelete(id);
  sendSuccess(res, 200, 'Volunteer successfully removed from your NGO');
});

const verifyNgo = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new AppError('Unauthorized', 403);
  const { id } = req.params;
  
  await NGO.findByIdAndUpdate(id, { isVerified: true });
  sendSuccess(res, 200, 'NGO Verified');
});

// Campaign toggle handler (Moved here for simplicity of dashboard interactions)
const toggleCampaignRegistration = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') throw new AppError('Unauthorized', 403);
  const { id } = req.params;

  const campaign = await Campaign.findById(id);
  if (!campaign) throw new AppError('Campaign not found', 404);

  const hasRegistered = campaign.volunteers.map(v => v.toString()).includes(req.user._id.toString());
  
  // if trying to unregister, check time constraint
  if (hasRegistered) {
    const timeDiffMs = new Date(campaign.startDate) - new Date();
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);
    
    if (hoursDiff > 0 && hoursDiff <= 6) {
      throw new AppError('Too late to cancel registration (inside 6-hour lock window). Please contact the coordinator directly.', 400);
    }
    
    campaign.volunteers = campaign.volunteers.filter(v => v.toString() !== req.user._id.toString());
    await campaign.save();
    sendSuccess(res, 200, 'Unregistered successfully');
  } else {
    campaign.volunteers.push(req.user._id);
    await campaign.save();
    sendSuccess(res, 200, 'Registered successfully');
  }
});

// --- PROFILE MANAGEMENT ---

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, bio } = req.body;
  
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);
  
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();
  
  if (user.role === 'volunteer' && bio !== undefined) {
    await Volunteer.findOneAndUpdate({ userId: user._id }, { bio });
  }

  sendSuccess(res, 200, 'Profile updated successfully', user.toSafeObject());
});

const deleteNgoAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ngo') throw new AppError('Unauthorized', 403);
  
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) throw new AppError('NGO not found', 404);
  
  // Clean up affiliations & campaigns to preserve DB integrity (hard delete approach requested / implied)
  await VolunteerAffiliation.deleteMany({ ngoId: ngo._id });
  await Campaign.deleteMany({ ngoId: ngo._id });
  
  await NGO.findByIdAndDelete(ngo._id);
  await User.findByIdAndDelete(req.user._id);
  
  sendSuccess(res, 200, 'NGO Account and associated data successfully deleted');
});

const deleteVolunteerAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') throw new AppError('Unauthorized', 403);

  const volunteer = await Volunteer.findOne({ userId: req.user._id });
  if (!volunteer) throw new AppError('Volunteer profile not found', 404);

  // Remove volunteer from all campaigns
  await Campaign.updateMany(
    { volunteers: req.user._id },
    { $pull: { volunteers: req.user._id } }
  );

  // Delete all affiliations
  await VolunteerAffiliation.deleteMany({ volunteerId: req.user._id });

  // Delete volunteer profile and user account
  await Volunteer.findByIdAndDelete(volunteer._id);
  await User.findByIdAndDelete(req.user._id);

  sendSuccess(res, 200, 'Volunteer Account and associated data successfully deleted');
});

module.exports = {
  getVolunteerDashboard,
  getNgoDashboard,
  getAdminDashboard,
  requestNgoAffiliation,
  respondToAffiliation,
  removeAffiliation,
  verifyNgo,
  toggleCampaignRegistration,
  updateProfile,
  deleteNgoAccount,
  deleteVolunteerAccount
};
