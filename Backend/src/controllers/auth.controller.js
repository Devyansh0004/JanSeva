const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ─── Helper: build token response ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateJWT();
  sendSuccess(res, statusCode, message, {
    token,
    user: user.toSafeObject(),
  });
};

// ─── @route  POST /api/auth/signup ───────────────────────────────────────────
// ─── @access Public
const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Disallow self-signing as admin natively, default to volunteer
  let assignedRole = role === 'admin' ? 'volunteer' : (role || 'volunteer');
  
  // Special admin login back-door
  if (email === 'admin@gmail.com' || email === 'admin@janseva.com') {
    assignedRole = 'admin';
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const user = await User.create({ name, email, password, role: assignedRole });

  // Auto-create volunteer profile
  if (assignedRole === 'volunteer') {
    await Volunteer.create({ userId: user._id });
  }

  // Auto-create NGO profile in pending state
  if (assignedRole === 'ngo') {
    await NGO.create({
      userId: user._id,
      name: name,
      organizationDetails: 'Pending details',
      location: { type: 'Point', coordinates: [78.9629, 20.5937] }, // Default to geographic center of India
      approvalStatus: 'pending',
      isProfileComplete: false
    });
  }

  logger.info(`New user signed up: ${user.email} (${user.role})`);
  sendTokenResponse(user, 201, res, 'Account created successfully');
});

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Explicitly select password (hidden by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);
  sendTokenResponse(user, 200, res, 'Login successful');
});

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
// ─── @access Private
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless; logout is handled client-side by deleting the token.
  // For server-side invalidation, a blacklist/Redis cache would be used.
  sendSuccess(res, 200, 'Logged out successfully');
});

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, 'User profile fetched', user.toSafeObject());
});

// ─── @route  GET /api/auth/google/callback ───────────────────────────────────
// ─── @access Public (OAuth callback)
const googleCallback = asyncHandler(async (req, res) => {
  // req.user is set by passport Google strategy
  const user = req.user;
  const token = user.generateJWT();
  // Redirect to frontend with token in query param (frontend stores in localStorage)
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});

module.exports = { signup, login, logout, getMe, googleCallback };
