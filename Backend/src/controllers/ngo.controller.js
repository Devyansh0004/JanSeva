const NGO = require('../models/NGO');
const Contribution = require('../models/Contribution');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ─── GET /api/ngos ────────────────────────────────────────────────────────────
const getAllNGOs = asyncHandler(async (req, res) => {
  const { state, focus, limit = 50, page = 1 } = req.query;
  const filter = { isVerified: true };
  if (state) filter.state = new RegExp(state, 'i');
  if (focus) filter.focusAreas = focus;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [ngos, total] = await Promise.all([
    NGO.find(filter).sort({ impactScore: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    NGO.countDocuments(filter),
  ]);
  sendSuccess(res, 200, 'NGOs fetched', ngos, { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// ─── GET /api/ngos/ranked — $lookup + $addFields scoring ─────────────────────
const getRankedNGOs = asyncHandler(async (req, res) => {
  const ranked = await NGO.aggregate([
    { $match: { isVerified: true } },
    // $lookup to join with contributions for real fund data
    {
      $lookup: {
        from: 'contributions',
        localField: '_id',
        foreignField: 'ngoId',
        as: 'contributionDocs',
        pipeline: [{ $match: { type: 'monetary' } }],
      },
    },
    {
      $addFields: {
        realFundsRaised: { $sum: '$contributionDocs.amount' },
        contributionCount: { $size: '$contributionDocs' },
        // Composite ranking score
        score: {
          $round: [{
            $add: [
              '$impactScore',
              { $multiply: ['$volunteerCount', 0.5] },
              { $divide: [{ $add: ['$totalContributions', 1] }, 100000] },
            ],
          }, 1],
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: 20 },
    {
      $project: {
        name: 1, state: 1, city: 1, focusAreas: 1,
        impactScore: 1, volunteerCount: 1, totalContributions: 1,
        contributionLevel: 1, foundedYear: 1, score: 1,
        realFundsRaised: 1, contributionCount: 1,
      },
    },
  ]);
  sendSuccess(res, 200, 'NGO rankings fetched', ranked);
});

// ─── GET /api/ngos/search?q= — Flexible Regex Search ───────────────────────────
const searchNGOs = asyncHandler(async (req, res) => {
  const { q, state, focus } = req.query;
  if (!q || q.trim().length < 2) throw new AppError('Search query too short (min 2 chars)', 400);

  const filter = { 
    isVerified: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { organizationDetails: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } }
    ]
  };
  
  if (state) filter.state = new RegExp(`^${state}$`, 'i');
  if (focus) filter.focusAreas = focus;

  const results = await NGO.find(filter)
    .sort({ impactScore: -1 })
    .limit(30)
    .lean();

  sendSuccess(res, 200, `Search results for "${q}"`, results);
});

// ─── GET /api/ngos/nearby?lat=&lng=&radius= — Real $near 2dsphere query ──────
const getNearbyNGOs = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 300 } = req.query;
  if (!lat || !lng) throw new AppError('lat and lng query params are required', 400);

  const latF = parseFloat(lat);
  const lngF = parseFloat(lng);
  const radiusM = parseFloat(radius) * 1000; // km → metres for $near

  // Try real GeoJSON $near first (requires 2dsphere index)
  let ngos = [];
  try {
    ngos = await NGO.find({
      isVerified: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lngF, latF] },
          $maxDistance: radiusM,
        },
      },
    }).lean();
  } catch {
    // Fallback: bounding-box approximation if 2dsphere index not yet created
    const latDelta = parseFloat(radius) / 111;
    const lngDelta = parseFloat(radius) / (111 * Math.cos((latF * Math.PI) / 180));
    ngos = await NGO.find({
      isVerified: true,
      'coordinates.lat': { $gte: latF - latDelta, $lte: latF + latDelta },
      'coordinates.lng': { $gte: lngF - lngDelta, $lte: lngF + lngDelta },
    }).lean();
  }

  // Attach computed distance
  const withDist = ngos.map(ngo => {
    const dLat = ((ngo.coordinates.lat - latF) * Math.PI) / 180;
    const dLng = ((ngo.coordinates.lng - lngF) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((latF * Math.PI) / 180) * Math.cos((ngo.coordinates.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return { ...ngo, distanceKm: Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10 };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  sendSuccess(res, 200, `${withDist.length} NGOs within ${radius}km`, withDist);
});

// ─── GET /api/ngos/:id ────────────────────────────────────────────────────────
const getNGOById = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id).lean();
  if (!ngo) throw new AppError('NGO not found', 404);
  sendSuccess(res, 200, 'NGO fetched', ngo);
});

module.exports = { getAllNGOs, getRankedNGOs, searchNGOs, getNearbyNGOs, getNGOById };
