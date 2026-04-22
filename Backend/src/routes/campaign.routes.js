const router = require('express').Router();
const { getCampaigns, createCampaign, createCampaignWithSurvey, joinCampaign, leaveCampaign, getMyCampaigns, getNgoCampaigns, getCampaignById, getCampaignDetailsNGO, getCampaignStats } = require('../controllers/campaign.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', optionalAuth, getCampaigns);
router.get('/stats', optionalAuth, getCampaignStats);
router.get('/:id', optionalAuth, getCampaignById);

router.use(protect);
router.get('/my', getMyCampaigns);
router.get('/ngo/my', getNgoCampaigns);
router.get('/ngo/:id', getCampaignDetailsNGO);
router.post('/', createCampaign);
router.post('/with-survey', upload.single('survey'), createCampaignWithSurvey);
router.post('/:id/join', joinCampaign);
router.post('/:id/leave', leaveCampaign);

module.exports = router;
