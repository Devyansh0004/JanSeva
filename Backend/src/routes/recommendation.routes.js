const router = require('express').Router();
const { getRecommendations } = require('../controllers/recommendation.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

router.get('/', optionalAuth, getRecommendations);

module.exports = router;
