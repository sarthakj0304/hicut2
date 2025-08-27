const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender'),
  body('role')
    .optional()
    .isIn(['rider', 'driver', 'both'])
    .withMessage('Please select a valid role'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.post('/send-phone-otp', authenticateToken, authController.sendPhoneOTP);
router.post(
  '/verify-phone-otp',
  authenticateToken,
  authController.verifyPhoneOTP
);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/updateProfile', authenticateToken, authController.updateProfile);
router.get('/login-history', authenticateToken, authController.getLoginHistory);
router.get(
  '/active-sessions',
  authenticateToken,
  authController.getActiveSessions
);
router.delete(
  '/sessions/:sessionId',
  authenticateToken,
  authController.revokeSession
);

module.exports = router;
