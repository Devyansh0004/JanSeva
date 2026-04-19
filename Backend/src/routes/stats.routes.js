const router = require('express').Router();
const {
  getOverview,
  getRequestsByCategory,
  getMonthlyRequests,
  getVolunteerDistribution,
  getPriorityBreakdown,
  getLocationBreakdown,
} = require('../controllers/stats.controller');
const { protect } = require('../middlewares/auth.middleware');

// All stats routes require authentication
router.use(protect);

router.get('/overview', getOverview);
router.get('/requests-by-category', getRequestsByCategory);
router.get('/monthly-requests', getMonthlyRequests);
router.get('/volunteer-distribution', getVolunteerDistribution);
router.get('/priority-breakdown', getPriorityBreakdown);
router.get('/location-breakdown', getLocationBreakdown);

module.exports = router;
