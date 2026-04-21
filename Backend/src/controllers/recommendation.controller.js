const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// ─── GET /api/recommendations — Smart NGO Matching ───────────────────────────
// Demonstrates: $lookup, $addFields scoring, $match, $sort, compound indexes
const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const { state, skills, lat, lng, limit = 6 } = req.query;

  let volunteerProfile = null;
  if (user) {
    volunteerProfile = await Volunteer.findOne({ userId: user._id }).lean();
  }

  const targetState = state || volunteerProfile?.location?.state || null;
  const targetSkills = skills
    ? skills.split(',')
    : volunteerProfile?.skills || [];

  const skillToFocusMap = {
    'First Aid': 'Medical', Medical: 'Medical',
    Cooking: 'Food', Teaching: 'Education',
    Construction: 'Shelter', Logistics: 'Emergency',
    Driving: 'Emergency', Counselling: 'Other',
    'IT Support': 'Other', Translation: 'Other',
  };
  const matchingFocusAreas = [...new Set(targetSkills.map(s => skillToFocusMap[s]).filter(Boolean))];

  let pipeline = [];

  // Feature 2: use $geoNear if coordinates provided
  if (lat && lng) {
    pipeline.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distanceKm',
        maxDistance: 1000000, // 1000 km
        spherical: true,
        query: { isVerified: true },
      },
    });
    pipeline.push({
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distanceKm', 1000] }, 1] },
      },
    });
  } else {
    pipeline.push({ $match: { isVerified: true } });
  }

  // Feature 1: $lookup volunteers matching this NGO's state → shows $lookup power
  pipeline.push({
    $lookup: {
      from: 'volunteers',
      let: { ngoState: '$state', ngoFocus: '$focusAreas' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$location.state', '$$ngoState'] },
                { $eq: ['$isAvailable', true] },
              ],
            },
          },
        },
        { $count: 'count' },
      ],
      as: 'localVolunteers',
    },
  });

  // Feature 6: $addFields composite score
  pipeline.push({
    $addFields: {
      localVolCount: { $ifNull: [{ $arrayElemAt: ['$localVolunteers.count', 0] }, 0] },
      matchScore: {
        $add: [
          // State match: +30 pts
          targetState ? { $cond: [{ $eq: ['$state', targetState] }, 30, 0] } : 0,
          // Focus area overlap: +20 per match
          {
            $multiply: [
              20,
              {
                $size: {
                  $filter: {
                    input: '$focusAreas',
                    as: 'f',
                    cond: { $in: ['$$f', matchingFocusAreas.length > 0 ? matchingFocusAreas : ['Food', 'Medical', 'Education', 'Shelter']] },
                  },
                },
              },
            ],
          },
          // Impact score contribution
          { $multiply: ['$impactScore', 0.3] },
        ],
      },
    },
  });

  pipeline.push({ $sort: { matchScore: -1, impactScore: -1 } });
  pipeline.push({ $limit: parseInt(limit) });
  pipeline.push({
    $project: {
      name: 1, city: 1, state: 1, focusAreas: 1, impactScore: 1,
      volunteerCount: 1, contributionLevel: 1, contactInfo: 1,
      coordinates: 1, matchScore: { $round: ['$matchScore', 0] },
      localVolCount: 1,
      distanceKm: 1,
    },
  });

  const recommendations = await NGO.aggregate(pipeline);

  sendSuccess(res, 200, 'Recommendations fetched', {
    recommendations,
    meta: {
      targetState,
      matchedSkills: targetSkills,
      matchedFocusAreas: matchingFocusAreas,
      geoEnabled: !!(lat && lng),
      mongodbPipeline: lat && lng
        ? '$geoNear → $lookup (volunteers) → $addFields (scoring) → $sort → $limit'
        : '$match → $lookup (volunteers) → $addFields (scoring) → $sort → $limit',
    },
  });
});

module.exports = { getRecommendations };
