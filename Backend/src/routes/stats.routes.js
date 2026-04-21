const router = require('express').Router();
const {
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
} = require('../controllers/stats.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

// All stats GET routes are public (optionalAuth = never blocks)
router.use(optionalAuth);

router.get('/overview', getOverview);
router.get('/ngo-locations', getNGOLocations);
router.get('/requests-by-category', getRequestsByCategory);
router.get('/monthly-requests', getMonthlyRequests);
router.get('/volunteer-distribution', getVolunteerDistribution);
router.get('/priority-breakdown', getPriorityBreakdown);
router.get('/location-breakdown', getLocationBreakdown);
router.get('/ngos-by-state', getNGOsByState);
router.get('/filtered-ngos', getFilteredNGOs);
router.get('/smart-insights', getSmartInsights);
router.get('/contribution-heatmap', getContributionHeatmap);
router.get('/volunteer-growth', getVolunteerGrowth);
router.get('/data-insights', getDataInsights);
router.get('/volunteer-allocation', getVolunteerAllocation);

module.exports = router;
