const router = require('express').Router();
const {
  requestToJoinNGO,
  getMyNGOs,
  getPendingRequests,
  getApprovedVolunteers,
  approveRequest,
  rejectRequest,
  assignHours,
  removeVolunteer
} = require('../controllers/volunteer-ngo.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Volunteer routes
router.post('/request', authorize('volunteer', 'user'), requestToJoinNGO);
router.get('/my-ngos', authorize('volunteer', 'user'), getMyNGOs);

// NGO routes
router.get('/pending', authorize('ngo'), getPendingRequests);
router.get('/approved', authorize('ngo'), getApprovedVolunteers);
router.patch('/:id/approve', authorize('ngo'), approveRequest);
router.patch('/:id/reject', authorize('ngo'), rejectRequest);
router.post('/:volunteerId/assign-hours', authorize('ngo'), assignHours);
router.delete('/:id', authorize('ngo'), removeVolunteer);

module.exports = router;
