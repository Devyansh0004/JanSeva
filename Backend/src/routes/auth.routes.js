const router = require('express').Router();
const passport = require('passport');
const {
  signup,
  login,
  logout,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { signupValidator, loginValidator } = require('../middlewares/validation.middleware');

// ─── Basic Auth ───────────────────────────────────────────────────────────────
router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);



module.exports = router;
