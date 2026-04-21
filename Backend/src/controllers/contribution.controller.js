const Contribution = require('../models/Contribution');
const NGO = require('../models/NGO');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ─── POST /api/contributions — Add contribution ───────────────────────────────
const addContribution = asyncHandler(async (req, res) => {
  const { ngoId, type, amount, hours, note, campaign } = req.body;
  if (!ngoId || !type) throw new AppError('ngoId and type are required', 400);

  const ngo = await NGO.findById(ngoId);
  if (!ngo) throw new AppError('NGO not found', 404);

  const contribution = await Contribution.create({
    userId: req.user._id,
    ngoId,
    type,
    amount: amount || 0,
    hours: hours || 0,
    note,
    campaign: campaign || null,
  });

  // Update NGO totalContributions
  if (type === 'monetary' && amount > 0) {
    await NGO.findByIdAndUpdate(ngoId, { $inc: { totalContributions: amount } });
  }

  sendSuccess(res, 201, 'Contribution recorded', contribution);
});

// ─── GET /api/contributions/my — User's own history ──────────────────────────
const getMyContributions = asyncHandler(async (req, res) => {
  const contributions = await Contribution.aggregate([
    { $match: { userId: req.user._id } },
    { $sort: { date: -1 } },
    {
      $lookup: {
        from: 'ngos',
        localField: 'ngoId',
        foreignField: '_id',
        as: 'ngo',
        pipeline: [{ $project: { name: 1, city: 1, state: 1 } }],
      },
    },
    { $unwind: { path: '$ngo', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        contributions: { $push: '$$ROOT' },
        totalMonetary: { $sum: { $cond: [{ $eq: ['$type', 'monetary'] }, '$amount', 0] } },
        totalHours: { $sum: { $cond: [{ $eq: ['$type', 'hours'] }, '$hours', 0] } },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = contributions[0] || { contributions: [], totalMonetary: 0, totalHours: 0, count: 0 };
  sendSuccess(res, 200, 'My contributions fetched', result);
});

// ─── GET /api/contributions/ngo/:id — Per-NGO totals ─────────────────────────
const getNGOContributions = asyncHandler(async (req, res) => {
  const totals = await Contribution.aggregate([
    { $match: { ngoId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
    {
      $group: {
        _id: '$type',
        total: { $sum: { $add: ['$amount', '$hours'] } },
        count: { $sum: 1 },
      },
    },
  ]);
  sendSuccess(res, 200, 'NGO contributions fetched', totals);
});

// ─── GET /api/contributions/leaderboard — Top NGOs by contribution ────────────
const getContributionLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Contribution.aggregate([
    { $match: { type: 'monetary' } },
    { $group: { _id: '$ngoId', totalRaised: { $sum: '$amount' }, donors: { $sum: 1 } } },
    { $sort: { totalRaised: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'ngos',
        localField: '_id',
        foreignField: '_id',
        as: 'ngo',
        pipeline: [{ $project: { name: 1, city: 1, state: 1, focusAreas: 1 } }],
      },
    },
    { $unwind: '$ngo' },
  ]);
  sendSuccess(res, 200, 'Contribution leaderboard fetched', leaderboard);
});

module.exports = { addContribution, getMyContributions, getNGOContributions, getContributionLeaderboard };
