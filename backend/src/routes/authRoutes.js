const express = require('express');
const { body } = require('express-validator');
const { register, login, updatePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateFields } = require('../middleware/validate');

const router = express.Router();

// Validation chains for name, email, password, and address
const registerValidator = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .withMessage('Must follow standard email validation rules.')
    .normalizeEmail(),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must include at least one special character.'),
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Must follow standard email validation rules.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const updatePasswordValidator = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be 8-16 characters.')
    .matches(/[A-Z]/)
    .withMessage('New password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('New password must include at least one special character.'),
];

// Register Normal User
router.post('/register', registerValidator, validateFields, register);

// Login (All Roles)
router.post('/login', loginValidator, validateFields, login);

// Update Password (All Roles, Requires Auth)
router.put('/password', authenticateToken, updatePasswordValidator, validateFields, updatePassword);

module.exports = router;
