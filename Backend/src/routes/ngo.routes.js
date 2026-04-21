const router = require('express').Router();
const { getAllNGOs, getRankedNGOs, searchNGOs, getNearbyNGOs, getNGOById } = require('../controllers/ngo.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

router.use(optionalAuth);

router.get('/', getAllNGOs);
router.get('/ranked', getRankedNGOs);
router.get('/search', searchNGOs);
router.get('/nearby', getNearbyNGOs);
router.get('/:id', getNGOById);

module.exports = router;
