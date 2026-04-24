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
  const { campaignId } = req.query;

  let villageQuery = {};
  if (campaignId) {
    villageQuery.campaignId = new mongoose.Types.ObjectId(campaignId);
  }

  const [totalVillages, criticalVillages, sectorAvgResult] = await Promise.all([
    db.collection('villageScores').countDocuments(villageQuery),
    db.collection('villageScores').countDocuments({ ...villageQuery, vulnerabilityClass: 'CRITICAL' }),
    db.collection('villageScores').aggregate([
      { $match: villageQuery },
      {
        $group: {
          _id: null,
          avgHealth: { $avg: '$healthScore' },
          avgFood: { $avg: '$foodScore' },
          avgEducation: { $avg: '$educationScore' },
          avgShelter: { $avg: '$shelterScore' }
        }
      }
    ]).toArray()
  ]);

  let totalVolunteers = 0;
  let avgScore = 0;
  
  if (campaignId) {
    // Registered volunteers for this campaign
    const regs = await db.collection('campaignregistrations').find({ campaignId: new mongoose.Types.ObjectId(campaignId) }).toArray();
    totalVolunteers = regs.length;
    const volIds = regs.map(r => r.volunteerId);
    if (volIds.length > 0) {
      const avgScoreResult = await db.collection('volunteerscores').aggregate([
        { $match: { volunteerId: { $in: volIds } } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } }
      ]).toArray();
      avgScore = avgScoreResult[0]?.avg || 0;
    }
  } else {
    totalVolunteers = await db.collection('volunteers').countDocuments();
    const avgScoreResult = await db.collection('volunteerscores').aggregate([
      { $group: { _id: null, avg: { $avg: '$totalScore' } } }
    ]).toArray();
    avgScore = avgScoreResult[0]?.avg || 0;
  }

  sendSuccess(res, 200, 'ML stats fetched', {
    totalVillages,
    criticalVillages,
    totalVolunteers,
    avgVolunteerScore: Math.round(avgScore * 10) / 10,
    sectorAverages: sectorAvgResult[0] || {},
    tierBreakdown: [] // Removing tier breakdown from basic stats since it's heavy and rarely used here
  });
});



// ─── GET /api/ml/village-rankings ─────────────────────────────────────────────
const getVillageRankings = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  const { domain, limit = 50, campaignId } = req.query;

  const sortField = domain === 'health' ? 'healthScore'
    : domain === 'food' ? 'foodScore'
    : domain === 'education' ? 'educationScore'
    : domain === 'shelter' ? 'shelterScore'
    : 'overallVulnerabilityScore';

  let matchQuery = {};
  if (domain) matchQuery.primaryDomain = domain;
  if (campaignId) matchQuery.campaignId = new mongoose.Types.ObjectId(campaignId);

  const villages = await db.collection('villageScores').aggregate([
    { $match: matchQuery },
    { $sort: { [sortField]: -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        villageId: 1, villageName: 1, state: 1, district: 1,
        overallVulnerabilityScore: 1, vulnerabilityClass: 1, primaryDomain: 1,
        healthScore: 1, foodScore: 1, educationScore: 1, shelterScore: 1,
        domainsAvailable: 1, population: 1, campaignId: 1
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
  const { tier, limit = 100, campaignId } = req.query;

  const matchStage = tier ? { 'scoreData.tier': tier } : {};

  let volunteerIds = null;
  if (campaignId) {
    const regs = await db.collection('campaignregistrations').find({ campaignId: new mongoose.Types.ObjectId(campaignId) }).toArray();
    volunteerIds = regs.map(r => r.volunteerId);
    if (volunteerIds.length === 0) return sendSuccess(res, 200, 'No volunteers', []);
  }

  const pipeline = [];
  if (volunteerIds) pipeline.push({ $match: { _id: { $in: volunteerIds } } });

  pipeline.push(
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
  );

  const volunteers = await db.collection('volunteers').aggregate(pipeline).toArray();

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
  const { campaignId } = req.query;

  // Since we have Assignments now, the deployment plan is just fetching assignments!
  let query = {};
  if (campaignId) query.campaignId = new mongoose.Types.ObjectId(campaignId);

  const assignments = await db.collection('assignments').find(query).toArray();
  
  if (assignments.length === 0) return sendSuccess(res, 200, 'Deployment plan fetched', []);

  // Fetch volunteers info
  const volIds = [...new Set(assignments.flatMap(a => a.volunteers_assigned))];
  const users = await db.collection('users').find({ _id: { $in: volIds } }).project({ name: 1 }).toArray();
  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u.name; });

  const volsScores = await db.collection('volunteerscores').find({ volunteerId: { $in: volIds } }).toArray();
  const scoreMap = {};
  volsScores.forEach(s => { scoreMap[s.volunteerId.toString()] = s; });

  const deploymentPlan = assignments.map(a => ({
    villageId: a.village_id,
    villageName: a.village_name,
    primaryDomain: a.domain,
    vulnerabilityClass: a.domain_score > 75 ? 'CRITICAL' : a.domain_score > 65 ? 'HIGH' : 'MEDIUM',
    overallVulnerabilityScore: a.domain_score,
    assignedVolunteers: a.volunteers_assigned.map(vid => {
      const vidStr = vid.toString();
      const score = scoreMap[vidStr];
      return {
        id: vidStr,
        name: userMap[vidStr] || 'Unknown',
        tier: score?.tier || 'D',
        matchScore: score?.totalScore || 0,
        skills: score?.skills || []
      }
    })
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

// ─── POST /api/ml/campaign/:id/run-matching ─────────────────────────────────
const runMatching = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = mongoose.connection.db;
  const campaignId = new mongoose.Types.ObjectId(id);

  // 1. Fetch Campaign
  const campaign = await db.collection('campaigns').findOne({ _id: campaignId });
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  // 2. Fetch registered volunteers
  const registered = await db.collection('campaignregistrations').find({ campaignId, status: 'registered' }).toArray();
  if (!registered.length) return res.status(400).json({ success: false, message: 'No registered volunteers found' });

  const volIds = registered.map(r => r.volunteerId);
  const scores = await db.collection('volunteerscores').find({ volunteerId: { $in: volIds } }).sort({ totalScore: -1 }).toArray();

  // Tier rotation
  const tierA = scores.filter(s => s.tier === 'A');
  const tierB = scores.filter(s => s.tier === 'B' || s.tier === 'C');
  const tierC = scores.filter(s => s.tier === 'D');

  const selected = [];
  selected.push(...tierA.slice(0, 25));
  selected.push(...tierB.slice(0, 50));
  selected.push(...tierC.slice(0, 25));

  if (selected.length < 100) {
    const remaining = scores.filter(s => !selected.includes(s));
    selected.push(...remaining.slice(0, 100 - selected.length));
  }

  const selectedUserIds = selected.map(s => s.volunteerId);

  // 3. Assign to villages (VillageScores)
  const vScores = await db.collection('villageScores').find({ campaignId }).sort({ overallVulnerabilityScore: -1 }).toArray();
  if (!vScores.length) return res.status(400).json({ success: false, message: 'No village scores found for this campaign' });
  
  // Actually, we'll just do sequential writes
  // a. Update matched
  for (const s of selected) {
    await db.collection('campaignregistrations').updateOne(
      { campaignId, volunteerId: s.volunteerId },
      { $set: { status: 'matched', matchScore: s.totalScore || 80, assignedVillageId: vScores[0].villageId } }
    );
  }
  
  // b. Update rejected
  await db.collection('campaignregistrations').updateMany(
    { campaignId, volunteerId: { $nin: selectedUserIds } },
    { $set: { status: 'rejected' } }
  );

  // c. Create Assignments
  await db.collection('assignments').deleteMany({ campaignId });
  const chunk = Math.ceil(selected.length / vScores.length);
  const newAssignments = [];
  
  for (let i = 0; i < vScores.length; i++) {
    const chunkVols = selected.slice(i * chunk, (i + 1) * chunk);
    if (!chunkVols.length) continue;
    
    newAssignments.push({
      campaignId,
      village_id: vScores[i].villageId,
      village_name: vScores[i].villageName,
      domain: campaign.category,
      priority_rank: i + 1,
      domain_score: vScores[i].overallVulnerabilityScore,
      funds_assigned: Math.floor((campaign.targetAmount || 0) / vScores.length),
      volunteers_needed: chunkVols.length,
      volunteers_assigned: chunkVols.map(v => v.volunteerId),
      group_id: `GRP_${vScores[i].villageId}`,
      group_rank_spread: chunkVols.map(v => v.totalScore),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Update proper assignedVillageId
    for (const cv of chunkVols) {
      await db.collection('campaignregistrations').updateOne(
        { campaignId, volunteerId: cv.volunteerId },
        { $set: { assignedVillageId: vScores[i].villageId } }
      );
    }
  }
  
  if (newAssignments.length) {
    await db.collection('assignments').insertMany(newAssignments);
  }

  // d. addToSet Campaign.volunteers
  await db.collection('campaigns').updateOne(
    { _id: campaignId },
    { $addToSet: { volunteers: { $each: selectedUserIds } } }
  );

  // e. Report
  await db.collection('campaignreports').insertOne({
    campaignId,
    ngoId: campaign.ngoId,
    generatedAt: new Date(),
    matchedCount: selected.length,
    villagesAssigned: newAssignments.length
  });

  res.json({ success: true, message: 'Matching successful', matchedCount: selected.length });
});

module.exports = { getStats, getVillageRankings, getVillageDetail, getRankedVolunteers, getSmartMatch, getDeploymentPlan, recompute, runMatching };
