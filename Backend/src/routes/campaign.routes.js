const router = require('express').Router();
const { getCampaigns, createCampaign, joinCampaign, getCampaignById, getCampaignStats } = require('../controllers/campaign.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');

router.get('/', optionalAuth, getCampaigns);
router.get('/stats', optionalAuth, getCampaignStats);
router.get('/:id', optionalAuth, getCampaignById);

router.use(protect);
router.post('/', createCampaign);
router.post('/:id/join', joinCampaign);

module.exports = router;
