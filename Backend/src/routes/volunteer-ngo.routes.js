const router = require('express').Router();
const {
  requestToJoinNGO,
  getMyNGOs,
  getPendingRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/volunteer-ngo.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Volunteer routes
router.post('/request', authorize('volunteer', 'user'), requestToJoinNGO);
router.get('/my-ngos', authorize('volunteer', 'user'), getMyNGOs);

// NGO routes
router.get('/pending', authorize('ngo'), getPendingRequests);
router.patch('/:id/approve', authorize('ngo'), approveRequest);
router.patch('/:id/reject', authorize('ngo'), rejectRequest);

module.exports = router;
