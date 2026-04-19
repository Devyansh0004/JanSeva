const router = require('express').Router();
const passport = require('passport');
const {
  signup,
  login,
  logout,
  getMe,
  googleCallback,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { signupValidator, loginValidator } = require('../middlewares/validation.middleware');

// ─── Basic Auth ───────────────────────────────────────────────────────────────
router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

module.exports = router;
