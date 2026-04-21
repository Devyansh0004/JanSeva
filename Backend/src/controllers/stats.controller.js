const ServiceRequest = require('../models/ServiceRequest');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const NGO = require('../models/NGO');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// ─── @route  GET /api/stats/overview ─────────────────────────────────────────
// ─── @access Private
const getOverview = asyncHandler(async (req, res) => {
  const [
    requestStats,
    volunteerStats,
    totalNGOs,
    totalUsers,
  ] = await Promise.all([
    ServiceRequest.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          highPriority: [
            { $match: { priority: 'High' } },
            { $count: 'count' },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]),
    Volunteer.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          available: [
            { $match: { isAvailable: true } },
            { $count: 'count' },
          ],
          assigned: [
            { $match: { isAvailable: false } },
            { $count: 'count' },
          ],
        },
      },
    ]),
    NGO.countDocuments({ isVerified: true }),
    User.countDocuments({ role: 'user' }),
  ]);

  const reqData = requestStats[0];
  const statusMap = {};
  reqData.byStatus.forEach(({ _id, count }) => (statusMap[_id] = count));

  const volData = volunteerStats[0];
  const totalVols = volData.total[0]?.count || 0;
  const availableVols = volData.available[0]?.count || 0;
  const assignedVols = volData.assigned[0]?.count || 0;

  const totalRequests = reqData.total[0]?.count || 0;
  const pendingRequests = statusMap['Pending'] || 0;
  const inProgressRequests = statusMap['In Progress'] || 0;
  const resolvedRequests = statusMap['Resolved'] || 0;
  const highPriorityRequests = reqData.highPriority[0]?.count || 0;

  const resolutionRate =
    totalRequests > 0 ? ((resolvedRequests / totalRequests) * 100).toFixed(1) : 0;

  const ngoParticipationRate =
    totalNGOs > 0 && totalRequests > 0
      ? ((totalNGOs / totalRequests) * 100).toFixed(1)
      : 0;

  sendSuccess(res, 200, 'Overview stats fetched', {
    requests: {
      total: totalRequests,
      pending: pendingRequests,
      inProgress: inProgressRequests,
      resolved: resolvedRequests,
      highPriority: highPriorityRequests,
      resolutionRate: parseFloat(resolutionRate),
    },
    volunteers: {
      total: totalVols,
      available: availableVols,
      assigned: assignedVols,
    },
    ngos: {
      verified: totalNGOs,
      participationRate: parseFloat(ngoParticipationRate),
    },
    users: {
      total: totalUsers,
    },
  });
});

// ─── @route  GET /api/stats/requests-by-category ─────────────────────────────
// ─── @access Private
const getRequestsByCategory = asyncHandler(async (req, res) => {
  const data = await ServiceRequest.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: 1,
        pending: 1,
        inProgress: 1,
        resolved: 1,
        highPriority: 1,
        resolutionRate: {
          $cond: [
            { $gt: ['$total', 0] },
            {
              $round: [
                { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  sendSuccess(res, 200, 'Category stats fetched', data);
});

// ─── @route  GET /api/stats/monthly-requests ─────────────────────────────────
// ─── @access Private
const getMonthlyRequests = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const data = await ServiceRequest.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        total: 1,
        resolved: 1,
        pending: 1,
        highPriority: 1,
        label: {
          $concat: [
            {
              $arrayElemAt: [
                [
                  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                ],
                '$_id.month',
              ],
            },
            ' ',
            { $toString: '$_id.year' },
          ],
        },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  sendSuccess(res, 200, 'Monthly request trends fetched', data);
});

// ─── @route  GET /api/stats/volunteer-distribution ───────────────────────────
// ─── @access Private
const getVolunteerDistribution = asyncHandler(async (req, res) => {
  const [availabilityDist, skillsDist, assignmentLoad] = await Promise.all([
    Volunteer.aggregate([
      { $group: { _id: '$availability', count: { $sum: 1 } } },
      { $project: { _id: 0, availability: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Volunteer.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $project: { _id: 0, skill: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Volunteer.aggregate([
      {
        $project: {
          assignedCount: { $size: '$assignedRequests' },
          isAvailable: 1,
        },
      },
      {
        $group: {
          _id: null,
          avgAssigned: { $avg: '$assignedCount' },
          maxAssigned: { $max: '$assignedCount' },
          totalAvailable: {
            $sum: { $cond: ['$isAvailable', 1, 0] },
          },
          totalBusy: {
            $sum: { $cond: ['$isAvailable', 0, 1] },
          },
        },
      },
      { $project: { _id: 0, avgAssigned: { $round: ['$avgAssigned', 1] }, maxAssigned: 1, totalAvailable: 1, totalBusy: 1 } },
    ]),
  ]);

  sendSuccess(res, 200, 'Volunteer distribution fetched', {
    byAvailability: availabilityDist,
    topSkills: skillsDist,
    workload: assignmentLoad[0] || {},
  });
});

// ─── @route  GET /api/stats/priority-breakdown ───────────────────────────────
// ─── @access Private
const getPriorityBreakdown = asyncHandler(async (req, res) => {
  const data = await ServiceRequest.aggregate([
    {
      $group: {
        _id: { priority: '$priority', status: '$status' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.priority',
        total: { $sum: '$count' },
        statuses: {
          $push: { status: '$_id.status', count: '$count' },
        },
      },
    },
    {
      $project: {
        _id: 0,
        priority: '$_id',
        total: 1,
        statuses: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  sendSuccess(res, 200, 'Priority breakdown fetched', data);
});

// ─── @route  GET /api/stats/location-breakdown ───────────────────────────────
// ─── @access Private
const getLocationBreakdown = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const data = await ServiceRequest.aggregate([
    {
      $group: {
        _id: '$location.city',
        total: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        city: '$_id',
        total: 1,
        resolved: 1,
        pending: 1,
      },
    },
    { $sort: { total: -1 } },
    { $limit: limit },
  ]);

  sendSuccess(res, 200, 'Location breakdown fetched', data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ENDPOINTS — DBMS SHOWCASE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── @route  GET /api/stats/ngo-locations ─────────────────────────────────────
// ─── @access Public (for home page map)
// ─── Demonstrates: $project, $match with coordinates
const getNGOLocations = asyncHandler(async (req, res) => {
  const data = await NGO.aggregate([
    {
      $match: {
        'coordinates.lat': { $exists: true, $ne: null },
        'coordinates.lng': { $exists: true, $ne: null },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        state: 1,
        city: 1,
        coordinates: 1,
        focusAreas: 1,
        volunteerCount: 1,
        contributionLevel: 1,
        totalContributions: 1,
        impactScore: 1,
        isVerified: 1,
        foundedYear: 1,
      },
    },
    { $sort: { impactScore: -1 } },
  ]);

  sendSuccess(res, 200, 'NGO locations fetched for map', data);
});

// ─── @route  GET /api/stats/ngos-by-state ────────────────────────────────────
// ─── @access Private
// ─── Demonstrates: $group, $sum, $sort, $push aggregation
const getNGOsByState = asyncHandler(async (req, res) => {
  const data = await NGO.aggregate([
    {
      $group: {
        _id: '$state',
        totalNGOs: { $sum: 1 },
        totalVolunteers: { $sum: '$volunteerCount' },
        totalContributions: { $sum: '$totalContributions' },
        avgImpactScore: { $avg: '$impactScore' },
        ngoNames: { $push: '$name' },
        focusAreas: { $push: '$focusAreas' },
      },
    },
    {
      $project: {
        _id: 0,
        state: '$_id',
        totalNGOs: 1,
        totalVolunteers: 1,
        totalContributions: 1,
        avgImpactScore: { $round: ['$avgImpactScore', 1] },
        ngoNames: 1,
      },
    },
    { $sort: { totalNGOs: -1 } },
  ]);

  sendSuccess(res, 200, 'NGOs by state fetched (aggregation pipeline)', data);
});

// ─── @route  GET /api/stats/filtered-ngos ────────────────────────────────────
// ─── @access Private
// ─── Demonstrates: Dynamic $match, $sort, $skip, $limit, compound index usage
const getFilteredNGOs = asyncHandler(async (req, res) => {
  const {
    state,
    focusArea,
    contributionLevel,
    minVolunteers,
    maxVolunteers,
    sortBy = 'impactScore',
    order = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  // Build dynamic match stage
  const matchStage = {};
  if (state) matchStage.state = state;
  if (focusArea) matchStage.focusAreas = focusArea;
  if (contributionLevel) matchStage.contributionLevel = contributionLevel;
  if (minVolunteers || maxVolunteers) {
    matchStage.volunteerCount = {};
    if (minVolunteers) matchStage.volunteerCount.$gte = parseInt(minVolunteers);
    if (maxVolunteers) matchStage.volunteerCount.$lte = parseInt(maxVolunteers);
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const allowedSorts = ['impactScore', 'volunteerCount', 'totalContributions', 'name', 'createdAt'];
  const sortField = allowedSorts.includes(sortBy) ? sortBy : 'impactScore';
  const sortOrder = order === 'asc' ? 1 : -1;

  const pipeline = [
    { $match: matchStage },
    {
      $project: {
        name: 1,
        state: 1,
        city: 1,
        focusAreas: 1,
        volunteerCount: 1,
        contributionLevel: 1,
        totalContributions: 1,
        impactScore: 1,
        isVerified: 1,
        foundedYear: 1,
        coordinates: 1,
      },
    },
    { $sort: { [sortField]: sortOrder } },
  ];

  // Get total count
  const countPipeline = [{ $match: matchStage }, { $count: 'total' }];
  const countResult = await NGO.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limitNum });

  const data = await NGO.aggregate(pipeline);

  sendSuccess(res, 200, 'Filtered NGOs fetched (dynamic query)', data, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    appliedFilters: matchStage,
    mongodbPipeline: JSON.stringify(pipeline, null, 2),
  });
});

// ─── @route  GET /api/stats/smart-insights ───────────────────────────────────
// ─── @access Private
// ─── Demonstrates: $facet for parallel pipelines, $sort, $limit, $group
const getSmartInsights = asyncHandler(async (req, res) => {
  const [ngoInsights, requestInsights, volunteerInsights] = await Promise.all([
    // Top performing NGO & state-level insights
    NGO.aggregate([
      {
        $facet: {
          topNGO: [
            { $sort: { impactScore: -1 } },
            { $limit: 1 },
            {
              $project: {
                name: 1, state: 1, city: 1, impactScore: 1,
                volunteerCount: 1, totalContributions: 1, focusAreas: 1,
              },
            },
          ],
          mostActiveState: [
            {
              $group: {
                _id: '$state',
                ngoCount: { $sum: 1 },
                totalVolunteers: { $sum: '$volunteerCount' },
                totalContributions: { $sum: '$totalContributions' },
              },
            },
            {
              $addFields: {
                activityScore: {
                  $add: [
                    { $multiply: ['$ngoCount', 10] },
                    { $multiply: ['$totalVolunteers', 1] },
                  ],
                },
              },
            },
            { $sort: { activityScore: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, state: '$_id', ngoCount: 1, totalVolunteers: 1, totalContributions: 1, activityScore: 1 } },
          ],
          underservedStates: [
            {
              $group: {
                _id: '$state',
                ngoCount: { $sum: 1 },
                totalVolunteers: { $sum: '$volunteerCount' },
              },
            },
            { $match: { ngoCount: { $lte: 1 } } },
            { $sort: { totalVolunteers: 1 } },
            { $limit: 5 },
            { $project: { _id: 0, state: '$_id', ngoCount: 1, totalVolunteers: 1 } },
          ],
          contributionByLevel: [
            {
              $group: {
                _id: '$contributionLevel',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalContributions' },
              },
            },
            { $project: { _id: 0, level: '$_id', count: 1, totalAmount: 1 } },
            { $sort: { totalAmount: -1 } },
          ],
        },
      },
    ]),

    // Request insights
    ServiceRequest.aggregate([
      {
        $facet: {
          requestsByState: [
            { $group: { _id: '$location.state', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, state: '$_id', count: 1 } },
          ],
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, category: '$_id', count: 1 } },
          ],
        },
      },
    ]),

    // Volunteer growth (monthly registration)
    Volunteer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]),
  ]);

  sendSuccess(res, 200, 'Smart insights fetched (multi-facet aggregation)', {
    topNGO: ngoInsights[0].topNGO[0] || null,
    mostActiveState: ngoInsights[0].mostActiveState[0] || null,
    underservedStates: ngoInsights[0].underservedStates,
    contributionByLevel: ngoInsights[0].contributionByLevel,
    requestsByState: requestInsights[0].requestsByState,
    categoryBreakdown: requestInsights[0].categoryBreakdown,
    volunteerGrowth: volunteerInsights,
  });
});

// ─── @route  GET /api/stats/contribution-heatmap ─────────────────────────────
// ─── @access Private
// ─── Demonstrates: $group, $sum, conditional intensity classification
const getContributionHeatmap = asyncHandler(async (req, res) => {
  const data = await NGO.aggregate([
    {
      $group: {
        _id: '$state',
        totalContributions: { $sum: '$totalContributions' },
        ngoCount: { $sum: 1 },
        avgImpact: { $avg: '$impactScore' },
        totalVolunteers: { $sum: '$volunteerCount' },
      },
    },
    {
      $addFields: {
        intensity: {
          $switch: {
            branches: [
              { case: { $gte: ['$totalContributions', 5000000] }, then: 'critical' },
              { case: { $gte: ['$totalContributions', 3000000] }, then: 'high' },
              { case: { $gte: ['$totalContributions', 1000000] }, then: 'medium' },
            ],
            default: 'low',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        state: '$_id',
        totalContributions: 1,
        ngoCount: 1,
        avgImpact: { $round: ['$avgImpact', 1] },
        totalVolunteers: 1,
        intensity: 1,
      },
    },
    { $sort: { totalContributions: -1 } },
  ]);

  sendSuccess(res, 200, 'Contribution heatmap fetched', data);
});

// ─── @route  GET /api/stats/volunteer-growth ─────────────────────────────────
// ─── @access Private
// ─── Demonstrates: $group by date, $sort, time-series analysis
const getVolunteerGrowth = asyncHandler(async (req, res) => {
  // Since volunteers are seeded with same createdAt,
  // we'll use volunteer distribution by state as growth proxy
  const byState = await Volunteer.aggregate([
    {
      $group: {
        _id: '$location.state',
        count: { $sum: 1 },
        available: {
          $sum: { $cond: ['$isAvailable', 1, 0] },
        },
        avgRating: { $avg: '$rating' },
        avgCompleted: { $avg: '$completedRequests' },
      },
    },
    {
      $project: {
        _id: 0,
        state: '$_id',
        count: 1,
        available: 1,
        avgRating: { $round: ['$avgRating', 1] },
        avgCompleted: { $round: ['$avgCompleted', 1] },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const bySkill = await Volunteer.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $project: { _id: 0, skill: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);

  sendSuccess(res, 200, 'Volunteer growth data fetched', {
    byState,
    bySkill,
  });
});

// ─── @route  GET /api/stats/data-insights — $facet multi-analysis (Feature 10) ─
const getDataInsights = asyncHandler(async (req, res) => {
  const Contribution = require('../models/Contribution');

  const [ngoFacets, volunteerFacets, requestFacets, contributionStats] = await Promise.all([
    // NGO multi-dimensional analysis using $facet
    NGO.aggregate([
      { $match: { isVerified: true } },
      {
        $facet: {
          byState: [
            { $group: { _id: '$state', count: { $sum: 1 }, avgImpact: { $avg: '$impactScore' }, totalVolunteers: { $sum: '$volunteerCount' } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          byContribLevel: [
            { $group: { _id: '$contributionLevel', count: { $sum: 1 }, totalFunds: { $sum: '$totalContributions' } } },
            { $sort: { totalFunds: -1 } },
          ],
          byFocusArea: [
            { $unwind: '$focusAreas' },
            { $group: { _id: '$focusAreas', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          topByImpact: [
            { $sort: { impactScore: -1 } },
            { $limit: 5 },
            { $project: { name: 1, state: 1, city: 1, impactScore: 1, volunteerCount: 1 } },
          ],
          inactiveNGOs: [
            { $match: { impactScore: { $lt: 30 }, volunteerCount: { $lt: 20 } } },
            { $count: 'count' },
          ],
          avgVolsPerState: [
            { $group: { _id: '$state', avgVols: { $avg: '$volunteerCount' } } },
            { $sort: { avgVols: -1 } },
          ],
        },
      },
    ]),

    // Volunteer multi-dimensional analysis using $facet + $bucket
    Volunteer.aggregate([
      {
        $facet: {
          byState: [
            { $group: { _id: '$location.state', count: { $sum: 1 }, available: { $sum: { $cond: ['$isAvailable', 1, 0] } } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          bySkill: [
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byAvailability: [
            { $group: { _id: '$availability', count: { $sum: 1 } } },
          ],
          // $bucket to group volunteers by completedRequests ranges
          byExperience: [
            {
              $bucket: {
                groupBy: '$completedRequests',
                boundaries: [0, 5, 15, 30, 50],
                default: '50+',
                output: { count: { $sum: 1 }, avgRating: { $avg: '$rating' } },
              },
            },
          ],
          topVolunteers: [
            { $sort: { completedRequests: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { name: 1, email: 1 } }],
              },
            },
            { $unwind: '$user' },
            { $project: { 'user.name': 1, completedRequests: 1, rating: 1, skills: 1, 'location.state': 1 } },
          ],
        },
      },
    ]),

    // Request trends using $group + $sort
    ServiceRequest.aggregate([
      {
        $facet: {
          monthlyGrowth: [
            {
              $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                total: { $sum: 1 },
                resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
            {
              $project: {
                _id: 0,
                label: { $concat: [{ $toString: '$_id.month' }, '/', { $toString: '$_id.year' }] },
                total: 1, resolved: 1,
                resRate: { $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 1] }, 0] },
              },
            },
          ],
          underservedStates: [
            { $group: { _id: '$location.state', pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }, total: { $sum: 1 } } },
            { $sort: { pending: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]),

    // Contribution aggregation
    Contribution.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: { $add: ['$amount', '$hours'] } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalHours: { $sum: '$hours' },
        },
      },
    ]),
  ]);

  sendSuccess(res, 200, 'Data insights fetched', {
    ngo: ngoFacets[0],
    volunteer: volunteerFacets[0],
    requests: requestFacets[0],
    contributions: contributionStats,
    mongodbFeatures: [
      '$facet — multi-pipeline parallel aggregation',
      '$bucket — volunteer experience grouping',
      '$lookup — volunteer↔user join',
      '$group, $sort, $match — state/skill/trend analysis',
    ],
  });
});

// ─── @route  GET /api/stats/volunteer-allocation — Feature 1 ─────────────────
// Matches volunteers to NGOs using $lookup + compound index on skills+state
const getVolunteerAllocation = asyncHandler(async (req, res) => {
  const { skills, state } = req.query;

  const skillList = skills ? skills.split(',') : ['First Aid', 'Medical', 'Teaching', 'Cooking'];
  const targetState = state || null;

  const matches = await Volunteer.aggregate([
    // Feature 1: match by skills using compound index
    { $match: { skills: { $in: skillList }, isAvailable: true } },
    // $lookup from NGOs
    {
      $lookup: {
        from: 'ngos',
        let: { volState: '$location.state', volSkills: '$skills' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$isVerified', true] },
                  targetState ? { $eq: ['$state', targetState] } : { $literal: true },
                ],
              },
            },
          },
          { $project: { name: 1, state: 1, city: 1, focusAreas: 1, volunteerCount: 1 } },
          { $limit: 3 },
        ],
        as: 'matchedNGOs',
      },
    },
    { $match: { 'matchedNGOs.0': { $exists: true } } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.name': 1,
        'user.email': 1,
        skills: 1,
        availability: 1,
        completedRequests: 1,
        rating: 1,
        'location.state': 1,
        'location.city': 1,
        matchedNGOs: 1,
      },
    },
    { $sort: { rating: -1, completedRequests: -1 } },
    { $limit: 10 },
  ]);

  sendSuccess(res, 200, 'Volunteer allocation fetched', {
    matches,
    query: { skills: skillList, state: targetState },
    mongodbPipeline: '$match (skills compound index) → $lookup (NGOs) → $lookup (users) → $sort → $limit',
    totalMatches: matches.length,
  });
});

module.exports = {
  getOverview,
  getRequestsByCategory,
  getMonthlyRequests,
  getVolunteerDistribution,
  getPriorityBreakdown,
  getLocationBreakdown,
  getNGOLocations,
  getNGOsByState,
  getFilteredNGOs,
  getSmartInsights,
  getContributionHeatmap,
  getVolunteerGrowth,
  getDataInsights,
  getVolunteerAllocation,
};

