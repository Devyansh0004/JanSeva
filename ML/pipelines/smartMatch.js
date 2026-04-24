/**
 * Smart Volunteer Matching Pipeline
 * Finds the best volunteers for a given village based on:
 * - Skill overlap with village's primaryDomain
 * - State-level proximity (geo-proximity approx)
 * - Volunteer score from volunteerscores
 * - Availability
 */

// Indian state lat/lon centroids for proximity scoring
const STATE_CENTROIDS = {
  'Andhra Pradesh': [15.9129, 79.7400],
  'Arunachal Pradesh': [28.2180, 94.7278],
  'Assam': [26.2006, 92.9376],
  'Bihar': [25.0961, 85.3131],
  'Chhattisgarh': [21.2787, 81.8661],
  'Goa': [15.2993, 74.1240],
  'Gujarat': [22.2587, 71.1924],
  'Haryana': [29.0588, 76.0856],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jharkhand': [23.6102, 85.2799],
  'Karnataka': [15.3173, 75.7139],
  'Kerala': [10.8505, 76.2711],
  'Madhya Pradesh': [22.9734, 78.6569],
  'Maharashtra': [19.7515, 75.7139],
  'Manipur': [24.6637, 93.9063],
  'Meghalaya': [25.4670, 91.3662],
  'Mizoram': [23.1645, 92.9376],
  'Nagaland': [26.1584, 94.5624],
  'Odisha': [20.9517, 85.0985],
  'Punjab': [31.1471, 75.3412],
  'Rajasthan': [27.0238, 74.2179],
  'Sikkim': [27.5330, 88.5122],
  'Tamil Nadu': [11.1271, 78.6569],
  'Telangana': [18.1124, 79.0193],
  'Tripura': [23.9408, 91.9882],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Uttarakhand': [30.0668, 79.0193],
  'West Bengal': [22.9868, 87.8550],
  'Delhi': [28.7041, 77.1025],
  'Jammu and Kashmir': [33.7782, 76.5762],
  'Ladakh': [34.1526, 77.5770]
};

// Domain → required skills mapping (from real DB)
const DOMAIN_SKILL_MAP = {
  'Healthcare & Wellness': ['Medical', 'First Aid', 'Counselling'],
  'Food Security & Distribution': ['Cooking', 'Logistics', 'Driving', 'First Aid'],
  'Education & Mentorship': ['Teaching', 'Counselling', 'Translation', 'IT Support'],
  'Shelter & Caregiving': ['Construction', 'Logistics', 'Driving', 'Counselling'],
  'Emergency & Disaster Response': ['Medical', 'First Aid', 'Logistics', 'Driving', 'Construction']
};

function buildSmartMatchPipeline(primaryDomain, villageState, topN = 5) {
  const requiredSkills = DOMAIN_SKILL_MAP[primaryDomain] || [];
  const villageCentroid = STATE_CENTROIDS[villageState] || [20.5937, 78.9629]; // Default India center

  return [
    // Stage 1: Only available volunteers
    { $match: { isAvailable: true } },

    // Stage 2: Lookup volunteer score
    {
      $lookup: {
        from: 'volunteerscores',
        localField: 'userId',
        foreignField: 'volunteerId',
        as: 'scoreData'
      }
    },
    { $unwind: { path: '$scoreData', preserveNullAndEmptyArrays: true } },

    // Stage 3: Skill overlap score
    {
      $addFields: {
        matchingSkills: {
          $setIntersection: ['$skills', requiredSkills]
        }
      }
    },
    {
      $addFields: {
        skillOverlapScore: {
          $cond: [
            { $gt: [requiredSkills.length, 0] },
            {
              $multiply: [
                { $divide: [{ $size: '$matchingSkills' }, requiredSkills.length] },
                100
              ]
            },
            0
          ]
        }
      }
    },

    // Stage 4: Domain alignment score
    {
      $addFields: {
        domainAligned: {
          $in: [primaryDomain, { $ifNull: ['$domains', []] }]
        }
      }
    },

    // Stage 5: Geo proximity score using state centroids
    // Haversine approximation via $addFields math
    {
      $addFields: {
        _stateLat: {
          $switch: {
            branches: Object.entries(STATE_CENTROIDS).map(([state, [lat]]) => ({
              case: { $eq: ['$location.state', state] },
              then: lat
            })),
            default: 20.5937
          }
        },
        _stateLng: {
          $switch: {
            branches: Object.entries(STATE_CENTROIDS).map(([state, [, lng]]) => ({
              case: { $eq: ['$location.state', state] },
              then: lng
            })),
            default: 78.9629
          }
        }
      }
    },
    {
      $addFields: {
        // Simple Euclidean distance in degrees as approximation
        _latDiff: { $abs: { $subtract: ['$_stateLat', villageCentroid[0]] } },
        _lngDiff: { $abs: { $subtract: ['$_stateLng', villageCentroid[1]] } }
      }
    },
    {
      $addFields: {
        _distDeg: { $sqrt: { $add: [{ $multiply: ['$_latDiff', '$_latDiff'] }, { $multiply: ['$_lngDiff', '$_lngDiff'] }] } }
      }
    },
    {
      $addFields: {
        // 0 distance = 100 score; 30 degrees distance = 0 score (capped)
        distanceScore: {
          $max: [
            { $multiply: [{ $subtract: [1, { $divide: ['$_distDeg', 30] }] }, 100] },
            0
          ]
        }
      }
    },

    // Stage 6: Final match score
    {
      $addFields: {
        matchScore: {
          $add: [
            { $multiply: [{ $ifNull: ['$scoreData.availabilityScore', 0] }, 0.15] },
            { $multiply: ['$distanceScore', 0.20] },
            { $multiply: ['$skillOverlapScore', 0.35] },
            { $multiply: [{ $ifNull: ['$scoreData.totalScore', 0] }, 0.30] }
          ]
        },
        tier: { $ifNull: ['$scoreData.tier', 'D'] },
        totalScore: { $ifNull: ['$scoreData.totalScore', 0] }
      }
    },

    // Stage 7: Project clean output
    {
      $project: {
        _id: 1,
        userId: 1,
        skills: 1,
        domains: 1,
        availability: 1,
        location: 1,
        matchingSkills: 1,
        skillOverlapScore: { $round: ['$skillOverlapScore', 1] },
        distanceScore: { $round: ['$distanceScore', 1] },
        domainAligned: 1,
        matchScore: { $round: ['$matchScore', 2] },
        tier: 1,
        totalScore: { $round: ['$totalScore', 2] },
        volunteeringHours: 1,
        rating: 1
      }
    },

    // Stage 8: Use $facet for tier diversity
    {
      $facet: {
        tierA: [
          { $match: { tier: 'A' } },
          { $sort: { matchScore: -1 } },
          { $limit: 1 }
        ],
        tierBC: [
          { $match: { tier: { $in: ['B', 'C'] } } },
          { $sort: { matchScore: -1 } },
          { $limit: 2 }
        ],
        tierD: [
          { $match: { tier: 'D' } },
          { $sort: { matchScore: -1 } },
          { $limit: 1 }
        ],
        all: [
          { $sort: { matchScore: -1 } },
          { $limit: topN + 5 }
        ]
      }
    }
  ];
}

module.exports = { buildSmartMatchPipeline, DOMAIN_SKILL_MAP, STATE_CENTROIDS };
