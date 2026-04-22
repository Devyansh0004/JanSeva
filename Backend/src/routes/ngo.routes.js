const router = require('express').Router();
const { 
  getAllNGOs, getRankedNGOs, searchNGOs, getNearbyNGOs, getNGOById,
  getPendingNGOs, approveNGO, rejectNGO, getMyNGOProfile, updateMyNGOProfile, deleteMyNGOProfile
} = require('../controllers/ngo.controller');
const { protect, authorize, optionalAuth } = require('../middlewares/auth.middleware');

// Public/Optional Auth routes
router.get('/', optionalAuth, getAllNGOs);
router.get('/ranked', optionalAuth, getRankedNGOs);
router.get('/search', optionalAuth, searchNGOs);
router.get('/nearby', optionalAuth, getNearbyNGOs);
router.get('/:id', optionalAuth, getNGOById);

// Protected routes
router.use(protect);

// NGO specific routes
router.get('/profile', authorize('ngo'), getMyNGOProfile);
router.put('/profile', authorize('ngo'), updateMyNGOProfile);
router.delete('/profile', authorize('ngo'), deleteMyNGOProfile);

// Admin specific routes
router.get('/admin/pending', authorize('admin'), getPendingNGOs);
router.patch('/admin/:id/approve', authorize('admin'), approveNGO);
router.patch('/admin/:id/reject', authorize('admin'), rejectNGO);

module.exports = router;
