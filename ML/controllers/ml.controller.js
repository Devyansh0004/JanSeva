const mongoose = require('mongoose');
const Volunteer = require('../../Backend/src/models/Volunteer');
const VillageScore = require('../../Backend/src/models/VillageScore');
const VolunteerScore = require('../../Backend/src/models/VolunteerScore');
const SkillWeight = require('../../Backend/src/models/SkillWeight');
const DomainSkillMap = require('../../Backend/src/models/DomainSkillMap');

const { buildVolunteerScoringPipeline } = require('../pipelines/volunteerScoring');
const { buildVulnerabilityPipeline, buildOverallVulnerabilityPipeline } = require('../pipelines/villageVulnerability');
const { buildSmartMatchPipeline } = require('../pipelines/smartMatch');
const { buildDeploymentPipeline } = require('../pipelines/deploymentPlan');

// Helper
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const sendSuccess = (res, code, msg, data) => res.status(code).json({ success: true, message: msg, data });

// ─── GET /api/ml/stats ────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;

  const [totalVillages, criticalVillages, totalVolunteers, avgScoreResult] = await Promise.all([
    db.collection('villageScores').countDocuments(),
    db.collection('villageScores').countDocuments({ vulnerabilityClass: 'CRITICAL' }),
    db.collection('volunteers').countDocuments(),
    db.collection('volunteerscores').aggregate([
      { $group: { _id: null, avg: { $avg: '$totalScore' } } }
    ]).toArray()
  ]);

  const avgScore = avgScoreResult[0]?.avg || 0;

  // Domain sector averages from villageScores
  const sectorAvg = await db.collection('villageScores').aggregate([
    {
      $group: {
        _id: null,
        avgHealth: { $avg: '$healthScore' },
        avgFood: { $avg: '$foodScore' },
        avgEducation: { $avg: '$educationScore' },
        avgShelter: { $avg: '$shelterScore' }
      }
    }
  ]).toArray();

  const tierBreakdown = await db.collection('volunteerscores').aggregate([
    { $group: { _id: '$tier', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();

  sendSuccess(res, 200, 'ML stats fetched', {
    totalVillages,
    criticalVillages,
    totalVolunteers,
    avgVolunteerScore: Math.round(avgScore * 10) / 10,
    sectorAverages: sectorAvg[0] || {},
    tierBreakdown
  });
});

// ─── GET /api/ml/village-rankings ─────────────────────────────────────────────
const getVillageRankings = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const { domain, limit = 50 } = req.query;

  const sortField = domain === 'health' ? 'healthScore'
    : domain === 'food' ? 'foodScore'
    : domain === 'education' ? 'educationScore'
    : domain === 'shelter' ? 'shelterScore'
    : 'overallVulnerabilityScore';

  const villages = await db.collection('villageScores').aggregate([
    { $match: {} },
    { $sort: { [sortField]: -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        villageId: 1, villageName: 1, state: 1, district: 1,
        overallVulnerabilityScore: 1, vulnerabilityClass: 1, primaryDomain: 1,
        healthScore: 1, foodScore: 1, educationScore: 1, shelterScore: 1,
        domainsAvailable: 1, population: 1
      }
    }
  ]).toArray();

  sendSuccess(res, 200, 'Village rankings fetched', villages);
});

// ─── GET /api/ml/village/:id/detail ───────────────────────────────────────────
const getVillageDetail = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const { id } = req.params;

  const village = await db.collection('villageScores').findOne({ villageId: id });
  if (!village) {
    return res.status(404).json({ success: false, message: 'Village not found in ML scores' });
  }

  // Percentile rank among all villages
  const totalVillages = await db.collection('villageScores').countDocuments();
  const lowerCount = await db.collection('villageScores').countDocuments({
    overallVulnerabilityScore: { $lt: village.overallVulnerabilityScore }
  });
  const percentileRank = totalVillages > 1 ? Math.round((lowerCount / (totalVillages - 1)) * 100) : 50;

  // Domain breakdown from surveyresponses
  const domainCounts = {};
  for (const type of ['health', 'food', 'education', 'shelter']) {
    const count = await db.collection('surveyresponses').countDocuments({ villageId: id, surveyType: type });
    domainCounts[type] = count;
  }

  sendSuccess(res, 200, 'Village detail fetched', {
    ...village,
    percentileRank,
    householdsPerDomain: domainCounts
  });
});

// ─── GET /api/ml/volunteers/ranked ────────────────────────────────────────────
const getRankedVolunteers = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const { tier, limit = 100 } = req.query;

  const matchStage = tier ? { 'scoreData.tier': tier } : {};

  const volunteers = await db.collection('volunteers').aggregate([
    {
      $lookup: {
        from: 'volunteerscores',
        localField: '_id',
        foreignField: 'volunteerId',
        as: 'scoreData'
      }
    },
    { $unwind: { path: '$scoreData', preserveNullAndEmpty: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmpty: true } },
    { $match: matchStage },
    { $sort: { 'scoreData.totalScore': -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        _id: 1,
        name: '$userInfo.name',
        email: '$userInfo.email',
        skills: 1,
        domains: 1,
        availability: 1,
        isAvailable: 1,
        location: 1,
        volunteeringHours: 1,
        completedRequests: 1,
        rating: 1,
        totalScore: { $ifNull: ['$scoreData.totalScore', 0] },
        tier: { $ifNull: ['$scoreData.tier', 'D'] },
        skillScore: { $ifNull: ['$scoreData.skillScore', 0] },
        experienceScore: { $ifNull: ['$scoreData.experienceScore', 0] },
        reliabilityScore: { $ifNull: ['$scoreData.reliabilityScore', 0] }
      }
    }
  ]).toArray();

  sendSuccess(res, 200, 'Ranked volunteers fetched', volunteers);
});

// ─── GET /api/ml/smart-match/:villageId ────────────────────────────────────────
const getSmartMatch = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const { villageId } = req.params;

  const village = await db.collection('villageScores').findOne({ villageId });
  if (!village) {
    return res.status(404).json({ success: false, message: 'Village not found in ML scores' });
  }

  const { primaryDomain, state, overallVulnerabilityScore, vulnerabilityClass } = village;
  const topN = vulnerabilityClass === 'CRITICAL' ? 5 : vulnerabilityClass === 'HIGH' ? 4 : 3;

  const pipeline = buildSmartMatchPipeline(primaryDomain, state, topN);
  const [result] = await db.collection('volunteers').aggregate(pipeline).toArray();

  // Merge facets and deduplicate, take top N
  const seen = new Set();
  const merged = [];

  // Priority: tierA first, then tierBC, then others
  for (const vol of [...(result?.tierA || []), ...(result?.tierBC || []), ...(result?.tierD || []), ...(result?.all || [])]) {
    if (!seen.has(vol._id.toString())) {
      seen.add(vol._id.toString());
      merged.push(vol);
    }
    if (merged.length >= topN) break;
  }

  // Enrich with user name
  const userIds = merged.map(v => v.userId);
  const users = await db.collection('users').find({ _id: { $in: userIds } }).project({ name: 1, email: 1 }).toArray();
  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u; });

  const enriched = merged.map(v => ({
    ...v,
    name: userMap[v.userId?.toString()]?.name || 'Unknown',
    email: userMap[v.userId?.toString()]?.email || 'Unknown'
  }));

  sendSuccess(res, 200, 'Smart match computed', {
    village,
    topN,
    consideredCount: (result?.all?.length || 0),
    matched: enriched
  });
});

// ─── GET /api/ml/deployment-plan ──────────────────────────────────────────────
const getDeploymentPlan = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const pipeline = buildDeploymentPipeline();
  const villages = await db.collection('villageScores').aggregate(pipeline).toArray();

  // For each village, fetch top 3 matched volunteers
  const deploymentPlan = await Promise.all(villages.map(async (village) => {
    const matchPipeline = buildSmartMatchPipeline(village.primaryDomain, village.state, village.volunteerSlots);
    const [matchResult] = await db.collection('volunteers').aggregate(matchPipeline).toArray();

    const seen = new Set();
    const vols = [];
    for (const v of [...(matchResult?.tierA || []), ...(matchResult?.tierBC || []), ...(matchResult?.all || [])]) {
      if (!seen.has(v._id.toString())) { seen.add(v._id.toString()); vols.push(v); }
      if (vols.length >= village.volunteerSlots) break;
    }

    const userIds = vols.map(v => v.userId);
    const users = await db.collection('users').find({ _id: { $in: userIds } }).project({ name: 1 }).toArray();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    return {
      ...village,
      assignedVolunteers: vols.map(v => ({
        id: v._id,
        name: userMap[v.userId?.toString()] || 'Unknown',
        tier: v.tier,
        matchScore: v.matchScore,
        skills: v.skills
      }))
    };
  }));

  sendSuccess(res, 200, 'Deployment plan computed', deploymentPlan);
});

// ─── POST /api/ml/recompute ────────────────────────────────────────────────────
const recompute = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;

  // 1. Ensure indexes
  await db.collection('volunteerscores').createIndex({ totalScore: -1, tier: 1 });
  await db.collection('villageScores').createIndex({ overallVulnerabilityScore: -1 });
  await db.collection('surveyresponses').createIndex({ villageId: 1, surveyType: 1 });
  await db.collection('skillweights').createIndex({ skill: 1 }, { unique: true, background: true }).catch(() => {});

  // 2. Ensure skillweights seeded
  const existingWeights = await db.collection('skillweights').countDocuments();
  if (existingWeights === 0) {
    await db.collection('skillweights').insertMany([
      { skill: 'Medical',      weight: 1.0,  tier: 'HIGH'   },
      { skill: 'First Aid',    weight: 0.9,  tier: 'HIGH'   },
      { skill: 'Counselling',  weight: 0.8,  tier: 'HIGH'   },
      { skill: 'Teaching',     weight: 0.65, tier: 'MEDIUM' },
      { skill: 'Construction', weight: 0.55, tier: 'MEDIUM' },
      { skill: 'Cooking',      weight: 0.50, tier: 'MEDIUM' },
      { skill: 'Logistics',    weight: 0.45, tier: 'MEDIUM' },
      { skill: 'Driving',      weight: 0.40, tier: 'MEDIUM' },
      { skill: 'Translation',  weight: 0.25, tier: 'LOW'    },
      { skill: 'IT Support',   weight: 0.15, tier: 'LOW'    }
    ]);
  }

  // 3. Ensure domainskillmap seeded
  const existingDomains = await db.collection('domainskillmap').countDocuments();
  if (existingDomains === 0) {
    await db.collection('domainskillmap').insertMany([
      { domain: 'Healthcare & Wellness',        skills: ['Medical', 'First Aid', 'Counselling'] },
      { domain: 'Food Security & Distribution', skills: ['Cooking', 'Logistics', 'Driving', 'First Aid'] },
      { domain: 'Education & Mentorship',       skills: ['Teaching', 'Counselling', 'Translation', 'IT Support'] },
      { domain: 'Shelter & Caregiving',         skills: ['Construction', 'Logistics', 'Driving', 'Counselling'] },
      { domain: 'Emergency & Disaster Response',skills: ['Medical', 'First Aid', 'Logistics', 'Driving', 'Construction'] }
    ]);
  }

  // 4. Run volunteer scoring pipeline
  const volPipeline = buildVolunteerScoringPipeline();
  await db.collection('volunteers').aggregate(volPipeline).toArray();

  // 5. Run village vulnerability pipelines for existing surveyresponses data
  const SurveyResponse = require('../../Backend/src/models/SurveyResponse');
  const hasSurveys = await db.collection('surveyresponses').countDocuments();

  let villagesProcessed = 0;
  if (hasSurveys > 0) {
    const { buildVulnerabilityPipeline: bvp, buildOverallVulnerabilityPipeline: bovp } = require('../pipelines/villageVulnerability');
    const domainMap = { health: 'healthScore', food: 'foodScore', education: 'educationScore', shelter: 'shelterScore' };
    for (const [surveyType, scoreField] of Object.entries(domainMap)) {
      const p = bvp(surveyType, scoreField);
      if (p) await db.collection('surveyresponses').aggregate(p).toArray();
    }
    await db.collection('villageScores').aggregate(bovp()).toArray();
    villagesProcessed = await db.collection('villageScores').countDocuments();
  }

  const volunteerCount = await db.collection('volunteerscores').countDocuments();

  sendSuccess(res, 200, 'Recompute successful', {
    volunteersScored: volunteerCount,
    villagesProcessed
  });
});

module.exports = { getStats, getVillageRankings, getVillageDetail, getRankedVolunteers, getSmartMatch, getDeploymentPlan, recompute };
