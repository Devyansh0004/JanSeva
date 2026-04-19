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
    // Request aggregation: status breakdown + high priority count
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

    // Volunteer stats
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

  // Normalize aggregation results
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
  // Default: last 12 months
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
    // Distribution by availability type
    Volunteer.aggregate([
      { $group: { _id: '$availability', count: { $sum: 1 } } },
      { $project: { _id: 0, availability: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Top skills across all volunteers
    Volunteer.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $project: { _id: 0, skill: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Distribution by assignment count (workload distribution)
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

module.exports = {
  getOverview,
  getRequestsByCategory,
  getMonthlyRequests,
  getVolunteerDistribution,
  getPriorityBreakdown,
  getLocationBreakdown,
};
