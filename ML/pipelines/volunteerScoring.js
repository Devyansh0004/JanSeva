/**
 * Volunteer Scoring Aggregation Pipeline
 * Computes a 0-100 score for every volunteer and merges into 'volunteerscores'.
 * 
 * Score = skillScore*0.35 + experienceScore*0.25 + reliabilityScore*0.20
 *       + availabilityScore*0.15 + domainDepthScore*0.05
 *
 * All data computed in MongoDB - no JS post-processing.
 */

// Availability → numeric score map (from live DB distinct values)
const AVAILABILITY_SCORES = {
  'Full-time': 1.0,
  'Part-time': 0.6,
  'On-call': 0.5,
  'Weekends': 0.35
};

function buildVolunteerScoringPipeline() {
  return [
    // Stage 1: Unwind skills to join with skillweights
    { $addFields: { skillsArray: '$skills' } },

    // Stage 2: Lookup skillweights for each skill
    {
      $lookup: {
        from: 'skillweights',
        localField: 'skills',
        foreignField: 'skill',
        as: 'skillWeightDocs'
      }
    },

    // Stage 3: Compute raw skill score (sum of weights) and normalize
    // Max possible = sum of all skill weights in DB = 10 skills
    // top weights: Medical(1.0)+FirstAid(0.9)+Counselling(0.8)+Teaching(0.65)+Construction(0.55)
    //              +Cooking(0.5)+Logistics(0.45)+Driving(0.4)+Translation(0.25)+IT Support(0.15) = 5.65
    {
      $addFields: {
        rawSkillWeightSum: {
          $reduce: {
            input: '$skillWeightDocs',
            initialValue: 0,
            in: { $add: ['$$value', '$$this.weight'] }
          }
        }
      }
    },
    {
      $addFields: {
        skillScore: {
          $min: [
            { $multiply: [{ $divide: ['$rawSkillWeightSum', 5.65] }, 100] },
            100
          ]
        }
      }
    },

    // Stage 4: Experience score - log10 normalization
    // hours: log10(hours+1)/log10(1001) capped at 1.0
    // requests: log10(requests+1)/log10(101) capped at 1.0
    {
      $addFields: {
        hoursNorm: {
          $min: [
            { $divide: [{ $log10: { $add: ['$volunteeringHours', 1] } }, { $log10: 1001 }] },
            1.0
          ]
        },
        requestsNorm: {
          $min: [
            { $divide: [{ $log10: { $add: ['$completedRequests', 1] } }, { $log10: 101 }] },
            1.0
          ]
        }
      }
    },
    {
      $addFields: {
        experienceScore: {
          $multiply: [
            { $divide: [{ $add: ['$hoursNorm', '$requestsNorm'] }, 2] },
            100
          ]
        }
      }
    },

    // Stage 5: Reliability score from rating (3.0-5.0 → 0-100, clamped at 0)
    {
      $addFields: {
        reliabilityScore: {
          $max: [
            { $multiply: [
              { $divide: [{ $subtract: [{ $ifNull: ['$rating', 3.0] }, 3.0] }, 2.0] },
              100
            ]},
            0
          ]
        }
      }
    },

    // Stage 6: Availability score via $switch on real DB values
    {
      $addFields: {
        availabilityScore: {
          $multiply: [
            {
              $switch: {
                branches: [
                  { case: { $eq: ['$availability', 'Full-time'] }, then: 1.0 },
                  { case: { $eq: ['$availability', 'Part-time'] }, then: 0.6 },
                  { case: { $eq: ['$availability', 'On-call'] }, then: 0.5 },
                  { case: { $eq: ['$availability', 'Weekends'] }, then: 0.35 }
                ],
                default: 0.35
              }
            },
            100
          ]
        }
      }
    },

    // Stage 7: Domain depth score - more domains = more breadth (capped at 3)
    {
      $addFields: {
        domainDepthScore: {
          $multiply: [
            { $min: [{ $divide: [{ $size: { $ifNull: ['$domains', []] } }, 3] }, 1.0] },
            100
          ]
        }
      }
    },

    // Stage 8: Total score (weighted sum)
    {
      $addFields: {
        totalScore: {
          $add: [
            { $multiply: ['$skillScore', 0.35] },
            { $multiply: ['$experienceScore', 0.25] },
            { $multiply: ['$reliabilityScore', 0.20] },
            { $multiply: ['$availabilityScore', 0.15] },
            { $multiply: ['$domainDepthScore', 0.05] }
          ]
        }
      }
    },

    // Stage 9: Tier classification
    {
      $addFields: {
        tier: {
          $switch: {
            branches: [
              { case: { $gte: ['$totalScore', 75] }, then: 'A' },
              { case: { $gte: ['$totalScore', 50] }, then: 'B' },
              { case: { $gte: ['$totalScore', 25] }, then: 'C' }
            ],
            default: 'D'
          }
        }
      }
    },

    // Stage 10: Project final output
    {
      $project: {
        volunteerId: '$userId',
        volunteerProfileId: '$_id',
        userId: 1,
        name: 1,
        skills: 1,
        domains: 1,
        availability: 1,
        isAvailable: 1,
        location: 1,
        skillScore: { $round: ['$skillScore', 2] },
        experienceScore: { $round: ['$experienceScore', 2] },
        reliabilityScore: { $round: ['$reliabilityScore', 2] },
        availabilityScore: { $round: ['$availabilityScore', 2] },
        domainDepthScore: { $round: ['$domainDepthScore', 2] },
        totalScore: { $round: ['$totalScore', 2] },
        tier: 1,
        computedAt: { $literal: new Date() }
      }
    },

    // Stage 11: Merge into volunteerscores
    {
      $merge: {
        into: 'volunteerscores',
        on: 'volunteerId',
        whenMatched: 'merge',
        whenNotMatched: 'insert'
      }
    }
  ];
}

module.exports = { buildVolunteerScoringPipeline };
