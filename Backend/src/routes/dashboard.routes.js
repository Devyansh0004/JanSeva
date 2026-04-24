const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getVolunteerDashboard,
  getNgoDashboard,
  getAdminDashboard,
  requestNgoAffiliation,
  respondToAffiliation,
  removeAffiliation,
  verifyNgo,
  toggleCampaignRegistration,
  updateProfile,
  deleteNgoAccount
} = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/volunteer', getVolunteerDashboard);
router.get('/ngo', getNgoDashboard);
router.get('/admin', getAdminDashboard);

// Actions
router.post('/request-ngo', requestNgoAffiliation);
router.put('/respond-affiliation', respondToAffiliation);
router.delete('/remove-affiliation/:id', removeAffiliation);
router.put('/verify-ngo/:id', verifyNgo);
router.post('/campaign-toggle/:id', toggleCampaignRegistration);
router.put('/profile', updateProfile);
router.delete('/profile/ngo', deleteNgoAccount);

module.exports = router;
