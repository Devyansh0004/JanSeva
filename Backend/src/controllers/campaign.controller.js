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
    .sort({ isEmergency: -1, startDate: 1 })
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
    isEmergency: req.body.isEmergency || false,
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

// ─── POST /api/campaigns/:id/leave — Volunteer leaves ─────────────────────────
const leaveCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new AppError('Campaign not found', 404);

  // Check 6h cutoff
  const timeUntilStart = new Date(campaign.startDate).getTime() - Date.now();
  if (timeUntilStart > 0 && timeUntilStart < 6 * 60 * 60 * 1000) {
    throw new AppError('Cannot unregister within 6 hours of event start', 400);
  }

  campaign.volunteers = campaign.volunteers.filter(v => v.toString() !== req.user._id.toString());
  await campaign.save();
  sendSuccess(res, 200, 'Left campaign successfully', { volunteersCount: campaign.volunteers.length });
});

// ─── GET /api/campaigns/my — Volunteer gets their registered campaigns ────────
const getMyCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ volunteers: req.user._id })
    .sort({ startDate: 1 })
    .lean();
  sendSuccess(res, 200, 'My campaigns fetched', campaigns);
});

// ─── GET /api/campaigns/ngo/my — NGO gets their created campaigns ────────────
const getNgoCampaigns = asyncHandler(async (req, res) => {
  const NGO = require('../models/NGO');
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) throw new AppError('NGO profile not found for this user', 404);

  const campaigns = await Campaign.find({ ngoId: ngo._id })
    .sort({ createdAt: -1 })
    .lean();
  
  // also fetch assignments for each campaign to show stats
  const Assignment = require('../models/Assignment');
  const campIds = campaigns.map(c => c._id);
  const assignments = await Assignment.find({ campaignId: { $in: campIds } }).lean();

  const cWithStats = campaigns.map(c => {
    const cAssigns = assignments.filter(a => a.campaignId.toString() === c._id.toString());
    return {
      ...c,
      villagesAided: cAssigns.length,
      assignedVolunteers: cAssigns.reduce((sum, a) => sum + a.volunteers_assigned.length, 0)
    };
  });

  sendSuccess(res, 200, 'NGO campaigns fetched', cWithStats);
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

const { parse } = require('csv-parse/sync');
const Village = require('../models/Village');
const Assignment = require('../models/Assignment');
const Volunteer = require('../models/Volunteer');

// ─── POST /api/campaigns/with-survey — Create Campaign & Run Aid Algorithm ─────
const createCampaignWithSurvey = asyncHandler(async (req, res) => {
  const { title, description, category, targetAmount, volunteerTarget, startDate, endDate, state, city } = req.body;
  if (!title || !description || !category || !startDate || !endDate)
    throw new AppError('title, description, category, startDate, endDate are required', 400);

  const NGO = require('../models/NGO');
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) throw new AppError('NGO profile not found for this user', 404);

  // 1. Create the Campaign
  const campaign = await Campaign.create({
    ngoId: ngo._id,
    title, description, category,
    targetAmount: targetAmount || 0,
    volunteerTarget: volunteerTarget || 10,
    startDate, endDate,
    isEmergency: req.body.isEmergency === 'true' || req.body.isEmergency === true,
    state: state || ngo.state,
    city: city || ngo.city,
    ngoSummary: { name: ngo.name, city: ngo.city, state: ngo.state },
  });

  // 2. Process CSV if provided
  let villagesCount = 0;
  let assignmentsCount = 0;

  if (req.file) {
    const csvData = req.file.buffer.toString('utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
    });

    const villageDocs = [];

    // 3. Score Villages
    for (const row of records) {
      // Score calculation logic translated from MongoDB Aggregation to JS
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

      const m_score = 
        (100 - (row.vaccination_coverage_pct || 0)) * 0.20 +
        (row.infant_mortality_rate_per_1000 || 0) * 0.30 +
        (row.malnutrition_children_pct || 0) * 0.25 +
        (row.avg_distance_to_hospital_km || 0) * 0.15 +
        (5 - clamp(row.doctors_per_1000 || 0, 0, 5)) * 20 * 0.10;

      const f_score = 
        (row.food_insecure_households_pct || 0) * 0.35 +
        (3 - (row.avg_meals_per_day || 0)) * 33.3 * 0.30 +
        (100 - (row.clean_water_access_pct || 0)) * 0.15 +
        (row.crop_failure_last_3_years || 0) * 33.3 * 0.10 +
        (100 - (row.ration_card_coverage_pct || 0)) * 0.10;

      const e_score = 
        (100 - (row.literacy_rate_pct || 0)) * 0.25 +
        (100 - (row.school_enrollment_pct || 0)) * 0.30 +
        clamp((row.student_teacher_ratio || 0) - 30, 0, 50) * 2 * 0.20 +
        (row.dropout_rate_pct || 0) * 0.15 +
        clamp(row.distance_to_school_km || 0, 0, 20) * 5 * 0.10;

      const s_score = 
        (row.homeless_or_damaged_homes_pct || 0) * 0.30 +
        clamp((row.avg_persons_per_room || 0) - 1, 0, 9) * 11.1 * 0.15 +
        (row.homes_without_electricity_pct || 0) * 0.15 +
        (row.homes_without_sanitation_pct || 0) * 0.20 +
        (row.disaster_affected_pct || 0) * 0.20;

      const overall_score = (m_score + f_score + e_score + s_score) / 4;

      villageDocs.push({
        campaignId: campaign._id,
        village_id: row.village_id,
        village_name: row.village_name,
        state: row.state,
        district: row.district,
        population: row.population,
        survey_date: row.survey_date ? new Date(row.survey_date) : new Date(),
        medical: {
          num_health_centers: row.num_health_centers,
          avg_distance_to_hospital_km: row.avg_distance_to_hospital_km,
          doctors_per_1000: row.doctors_per_1000,
          vaccination_coverage_pct: row.vaccination_coverage_pct,
          infant_mortality_rate_per_1000: row.infant_mortality_rate_per_1000,
          malnutrition_children_pct: row.malnutrition_children_pct,
          score: m_score
        },
        food: {
          food_insecure_households_pct: row.food_insecure_households_pct,
          avg_meals_per_day: row.avg_meals_per_day,
          clean_water_access_pct: row.clean_water_access_pct,
          crop_failure_last_3_years: row.crop_failure_last_3_years,
          ration_card_coverage_pct: row.ration_card_coverage_pct,
          score: f_score
        },
        education: {
          literacy_rate_pct: row.literacy_rate_pct,
          school_enrollment_pct: row.school_enrollment_pct,
          student_teacher_ratio: row.student_teacher_ratio,
          dropout_rate_pct: row.dropout_rate_pct,
          distance_to_school_km: row.distance_to_school_km,
          score: e_score
        },
        shelter: {
          homeless_or_damaged_homes_pct: row.homeless_or_damaged_homes_pct,
          avg_persons_per_room: row.avg_persons_per_room,
          homes_without_electricity_pct: row.homes_without_electricity_pct,
          homes_without_sanitation_pct: row.homes_without_sanitation_pct,
          disaster_affected_pct: row.disaster_affected_pct,
          score: s_score
        },
        overall_priority_score: overall_score
      });
    }

    const insertedVillages = await Village.insertMany(villageDocs);
    villagesCount = insertedVillages.length;

    // 4. Volunteer Ranking
    const volsToRank = await Volunteer.find({}).sort({ volunteeringHours: -1 });
    let currentRank = 1;
    for (const v of volsToRank) {
      await Volunteer.updateOne({ _id: v._id }, { $set: { rank: currentRank++ } });
    }

    // 5. Multi-Domain Assignment Logic
    let domainTargetsObj = {};
    if (req.body.domainTargets) {
      try {
        domainTargetsObj = JSON.parse(req.body.domainTargets);
      } catch(e) {}
    } else {
      // Fallback
      domainTargetsObj[category.toLowerCase()] = { villages: 3, volunteers: volunteerTarget };
    }

    const assignmentDocs = [];
    const allAssignedVolIds = new Set();
    const activeDomains = Object.keys(domainTargetsObj).map(d => d.toLowerCase());

    const domainSelectedVillages = {};
    let globalTotalScore = 0;

    for (const domainStr of activeDomains) {
      const targets = domainTargetsObj[domainStr];
      const targetV = parseInt(targets.villages) || 3;
      
      const topVillages = [...insertedVillages].sort((a, b) => {
        const scoreA = a[domainStr]?.score || 0;
        const scoreB = b[domainStr]?.score || 0;
        return scoreB - scoreA;
      }).slice(0, targetV);

      domainSelectedVillages[domainStr] = topVillages;
      
      topVillages.forEach(v => {
        globalTotalScore += (v[domainStr]?.score || 0);
      });
    }

    const targetAmount = parseFloat(req.body.targetAmount) || 0;

    for (const domainStr of activeDomains) {
      const targets = domainTargetsObj[domainStr];
      const topVillages = domainSelectedVillages[domainStr];
      const totalVolunteersForDomain = parseInt(targets.volunteers) || 10;
      
      const matchedVols = await Volunteer.find({ domains: domainStr }).sort({ rank: 1 });
      const K = topVillages.length;
      
      if (K > 0 && matchedVols.length > 0) {
        const domainTotalScore = topVillages.reduce((sum, v) => sum + (v[domainStr]?.score || 0), 0);

        // 1. Calculate how many volunteers each village needs proportionally
        const villageNeeds = topVillages.map(village => {
          const score = village[domainStr]?.score || 0;
          let needed = 0;
          if (domainTotalScore > 0) {
            needed = Math.round((score / domainTotalScore) * totalVolunteersForDomain);
          }
          if (needed === 0 && totalVolunteersForDomain > 0) needed = 1;
          return needed;
        });

        const totalNeededAcrossDomain = villageNeeds.reduce((a, b) => a + b, 0);
        const volsToDeal = matchedVols.slice(0, totalNeededAcrossDomain);
        
        const groups = Array.from({ length: K }, () => []);
        let volIndex = 0;
        let villagesStillNeeding = true;
        
        // 2. Capacity-Aware Round Robin Dealing
        while (volIndex < volsToDeal.length && villagesStillNeeding) {
          villagesStillNeeding = false;
          for (let idx = 0; idx < K; idx++) {
            if (groups[idx].length < villageNeeds[idx] && volIndex < volsToDeal.length) {
              groups[idx].push(volsToDeal[volIndex]);
              volIndex++;
              villagesStillNeeding = true;
            }
          }
        }

        topVillages.forEach((village, idx) => {
          const score = village[domainStr]?.score || 0;
          
          let fundsAssigned = 0;
          if (globalTotalScore > 0) {
            fundsAssigned = Math.round((score / globalTotalScore) * targetAmount);
          }

          const needed = villageNeeds[idx];
          const group = groups[idx];
          
          assignmentDocs.push({
            campaignId: campaign._id,
            village_id: village.village_id,
            village_name: village.village_name,
            domain: domainStr,
            priority_rank: idx + 1,
            domain_score: score,
            funds_assigned: fundsAssigned,
            volunteers_needed: needed,
            volunteers_assigned: group.map(g => g.userId),
            group_id: `GRP_${domainStr.substring(0,3).toUpperCase()}_${idx+1}`,
            group_rank_spread: group.map(g => g.rank)
          });

          group.forEach(g => allAssignedVolIds.add(g.userId.toString()));
        });
      }
    }

    if (assignmentDocs.length > 0) {
      await Assignment.insertMany(assignmentDocs);
      assignmentsCount = assignmentDocs.length;
      
      campaign.volunteers = Array.from(allAssignedVolIds);
      await campaign.save();
    }
  }

  sendSuccess(res, 201, 'Campaign created and surveyed successfully', {
    campaign,
    villagesProcessed: villagesCount,
    assignmentsCreated: assignmentsCount
  });
});

// ─── GET /api/campaigns/ngo/:id — NGO Campaign Details with Assignments ───────
const getCampaignDetailsNGO = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).lean();
  if (!campaign) throw new AppError('Campaign not found', 404);

  const Assignment = require('../models/Assignment');
  const Volunteer = require('../models/Volunteer');
  
  const assignments = await Assignment.find({ campaignId: campaign._id }).sort({ domain: 1, priority_rank: 1 }).lean();
  
  const allUserIds = [...new Set(assignments.flatMap(a => a.volunteers_assigned))];
  
  const vols = await Volunteer.find({ userId: { $in: allUserIds } })
    .populate('userId', 'name email')
    .lean();
    
  const volMap = {};
  vols.forEach(v => {
    if (v.userId) {
      volMap[v.userId._id.toString()] = {
        name: v.userId.name,
        email: v.userId.email,
        hours: v.volunteeringHours,
        rank: v.rank
      };
    }
  });

  const detailedAssignments = assignments.map(a => {
    return {
      ...a,
      volunteerDetails: a.volunteers_assigned.map(uid => volMap[uid.toString()] || { name: 'Unknown', hours: 0 })
    };
  });

  const Village = require('../models/Village');
  const rawSurvey = await Village.find({ campaignId: campaign._id }).lean();

  sendSuccess(res, 200, 'Detailed campaign fetched', { campaign, assignments: detailedAssignments, rawSurvey });
});

module.exports = { getCampaigns, createCampaign, createCampaignWithSurvey, joinCampaign, leaveCampaign, getMyCampaigns, getNgoCampaigns, getCampaignById, getCampaignDetailsNGO, getCampaignStats };
