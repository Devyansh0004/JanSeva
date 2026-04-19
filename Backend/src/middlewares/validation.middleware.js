const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Run validationResult and respond with errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────
const signupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'ngo', 'volunteer', 'user']).withMessage('Invalid role'),
  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

// ─── Service Request Validators ───────────────────────────────────────────────
const requestValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'])
    .withMessage('Invalid category'),
  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  validate,
];

// ─── Volunteer Assignment Validator ───────────────────────────────────────────
const assignVolunteerValidator = [
  body('requestId')
    .notEmpty().withMessage('Request ID is required')
    .isMongoId().withMessage('Invalid request ID'),
  body('volunteerId')
    .notEmpty().withMessage('Volunteer ID is required')
    .isMongoId().withMessage('Invalid volunteer ID'),
  validate,
];

// ─── ObjectId Param Validator ─────────────────────────────────────────────────
const objectIdValidator = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  validate,
];

module.exports = {
  signupValidator,
  loginValidator,
  requestValidator,
  assignVolunteerValidator,
  objectIdValidator,
  validate,
};
