const router = require('express').Router();
const { addContribution, getMyContributions, getNGOContributions, getContributionLeaderboard } = require('../controllers/contribution.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');

router.get('/leaderboard', optionalAuth, getContributionLeaderboard);
router.get('/ngo/:id', optionalAuth, getNGOContributions);

router.use(protect);
router.post('/', addContribution);
router.get('/my', getMyContributions);

module.exports = router;
