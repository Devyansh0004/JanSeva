const router = require('express').Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require('../controllers/request.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { requestValidator, objectIdValidator } = require('../middlewares/validation.middleware');

// Public routes (optional auth for personalized responses)
router.get('/', optionalAuth, getRequests);
router.get('/:id', objectIdValidator('id'), optionalAuth, getRequestById);

// Protected routes
router.post('/', protect, requestValidator, createRequest);
router.put('/:id', protect, objectIdValidator('id'), updateRequest);
router.delete('/:id', protect, objectIdValidator('id'), deleteRequest);

module.exports = router;
