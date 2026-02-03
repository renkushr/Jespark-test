import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    const firstMsg = arr[0]?.msg || 'Validation failed';
    return res.status(400).json({ 
      error: firstMsg,
      details: arr
    });
  }
  next();
};

// Authentication validators
export const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validate
];

export const loginValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

export const lineLoginValidator = [
  body('lineId')
    .trim()
    .notEmpty()
    .withMessage('LINE ID is required'),
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  validate
];

// User validators
export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  validate
];

export const addPointsValidator = [
  body('points')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Points must be between 1 and 10000'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required'),
  validate
];

// Wallet validators
export const topupValidator = [
  body('amount')
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Amount must be between 1 and 100000'),
  validate
];

export const paymentValidator = [
  body('amount')
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Amount must be between 1 and 100000'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required'),
  validate
];

// Reward validators
export const redeemValidator = [
  body('rewardId')
    .isInt({ min: 1 })
    .withMessage('Invalid reward ID'),
  validate
];

// Query validators
export const paginationValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  validate
];

export const idParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID'),
  validate
];
