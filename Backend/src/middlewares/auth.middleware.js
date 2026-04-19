const passport = require('passport');
const AppError = require('../utils/AppError');

/**
 * Middleware: Verify JWT and attach user to req.user
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      const message =
        info?.name === 'TokenExpiredError'
          ? 'Session expired. Please login again.'
          : 'Not authenticated. Please login.';
      return next(new AppError(message, 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware factory: Restrict access to specific roles
 * Usage: authorize('admin', 'ngo')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Optional auth: attaches user if token provided, doesn't fail if not
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};

module.exports = { protect, authorize, optionalAuth };
