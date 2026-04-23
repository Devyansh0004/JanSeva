const router = require('express').Router();
const passport = require('passport');
const {
  signup,
  login,
  logout,
  getMe,
  sendOtp,
  verifyOtpAndSignup,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { signupValidator, loginValidator } = require('../middlewares/validation.middleware');

// ─── Basic Auth ───────────────────────────────────────────────────────────────
router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ─── OTP Verification ────────────────────────────────────────────────────────
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndSignup);

module.exports = router;
