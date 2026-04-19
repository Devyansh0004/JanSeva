const router = require('express').Router();
const {
  assignVolunteer,
  unassignVolunteer,
  getMyVolunteerProfile,
  updateVolunteerProfile,
  getAllVolunteers,
} = require('../controllers/volunteer.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { assignVolunteerValidator } = require('../middlewares/validation.middleware');

// Volunteer's own profile
router.get('/profile', protect, authorize('volunteer'), getMyVolunteerProfile);
router.put('/profile', protect, authorize('volunteer'), updateVolunteerProfile);

// Admin/NGO actions
router.get('/all', protect, authorize('admin', 'ngo'), getAllVolunteers);
router.post('/assign', protect, authorize('admin', 'ngo'), assignVolunteerValidator, assignVolunteer);
router.post('/unassign', protect, authorize('admin', 'ngo'), assignVolunteerValidator, unassignVolunteer);

module.exports = router;
