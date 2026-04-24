/**
 * Deployment Plan Pipeline
 * Aggregates all CRITICAL and HIGH villages with their matched volunteer groups.
 */

function buildDeploymentPipeline() {
  return [
    // Filter only critical and high villages
    {
      $match: {
        vulnerabilityClass: { $in: ['CRITICAL', 'HIGH'] }
      }
    },

    // Determine volunteer slots based on vulnerability
    {
      $addFields: {
        volunteerSlots: {
          $switch: {
            branches: [
              { case: { $eq: ['$vulnerabilityClass', 'CRITICAL'] }, then: 5 },
              { case: { $eq: ['$vulnerabilityClass', 'HIGH'] }, then: 4 }
            ],
            default: 3
          }
        }
      }
    },

    // Sort by overall score descending
    { $sort: { overallVulnerabilityScore: -1 } },

    {
      $project: {
        villageId: 1,
        villageName: 1,
        state: 1,
        district: 1,
        overallVulnerabilityScore: 1,
        vulnerabilityClass: 1,
        primaryDomain: 1,
        healthScore: 1,
        foodScore: 1,
        educationScore: 1,
        shelterScore: 1,
        volunteerSlots: 1,
        domainsAvailable: 1
      }
    }
  ];
}

module.exports = { buildDeploymentPipeline };
