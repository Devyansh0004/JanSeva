const Campaign = require('../models/Campaign');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ─── GET /api/campaigns — List all campaigns (public) ────────────────────────
const getCampaigns = asyncHandler(async (req, res) => {
  const { status = 'Active', category, state } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (state) filter.state = new RegExp(state, 'i');

  const campaigns = await Campaign.find(filter)
    .sort({ startDate: -1 })
    .limit(20)
    .lean();

  sendSuccess(res, 200, 'Campaigns fetched', campaigns);
});

// ─── POST /api/campaigns — NGO creates campaign ───────────────────────────────
const createCampaign = asyncHandler(async (req, res) => {
  const { title, description, category, targetAmount, volunteerTarget, startDate, endDate, state, city } = req.body;
  if (!title || !description || !category || !startDate || !endDate)
    throw new AppError('title, description, category, startDate, endDate are required', 400);

  const NGO = require('../models/NGO');
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) throw new AppError('NGO profile not found for this user', 404);

  const campaign = await Campaign.create({
    ngoId: ngo._id,
    title, description, category,
    targetAmount: targetAmount || 0,
    volunteerTarget: volunteerTarget || 10,
    startDate, endDate,
    state: state || ngo.state,
    city: city || ngo.city,
    ngoSummary: { name: ngo.name, city: ngo.city, state: ngo.state },
  });

  sendSuccess(res, 201, 'Campaign created', campaign);
});

// ─── POST /api/campaigns/:id/join — Volunteer joins ──────────────────────────
const joinCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new AppError('Campaign not found', 404);
  if (campaign.status !== 'Active') throw new AppError('Campaign is not active', 400);

  const alreadyJoined = campaign.volunteers.some(v => v.toString() === req.user._id.toString());
  if (alreadyJoined) throw new AppError('You have already joined this campaign', 400);

  campaign.volunteers.push(req.user._id);
  await campaign.save();
  sendSuccess(res, 200, 'Joined campaign successfully', { volunteersCount: campaign.volunteers.length });
});

// ─── GET /api/campaigns/:id — Single campaign ────────────────────────────────
const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('volunteers', 'name email').lean();
  if (!campaign) throw new AppError('Campaign not found', 404);
  sendSuccess(res, 200, 'Campaign fetched', campaign);
});

// ─── GET /api/campaigns/stats — Campaign analytics ───────────────────────────
const getCampaignStats = asyncHandler(async (req, res) => {
  const stats = await Campaign.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 }, totalTarget: { $sum: '$targetAmount' }, totalRaised: { $sum: '$raisedAmount' } } }],
        topCampaigns: [
          { $sort: { raisedAmount: -1 } },
          { $limit: 5 },
          { $project: { title: 1, raisedAmount: 1, targetAmount: 1, status: 1, 'ngoSummary.name': 1 } },
        ],
      },
    },
  ]);
  sendSuccess(res, 200, 'Campaign stats fetched', stats[0]);
});

module.exports = { getCampaigns, createCampaign, joinCampaign, getCampaignById, getCampaignStats };
