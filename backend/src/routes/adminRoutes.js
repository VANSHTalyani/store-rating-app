const express = require('express');
const { body } = require('express-validator');
const { 
  getDashboardStats, 
  createUser, 
  createStore, 
  getUsers, 
  getStores 
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateFields } = require('../middleware/validate');

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(authenticateToken, requireAdmin);

// Validator for creating a new user
const createUserValidator = [
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
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be either admin, user, or store_owner.'),
];

// Validator for creating a new store
const createStoreValidator = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters.'),
  body('email')
    .isEmail()
    .withMessage('Must follow standard email validation rules.')
    .normalizeEmail(),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters.'),
  body('ownerId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Owner ID must be an integer.'),
];

// Admin Dashboard stats
router.get('/dashboard', getDashboardStats);

// Manage Users (Get list / Create new)
router.get('/users', getUsers);
router.post('/users', createUserValidator, validateFields, createUser);

// Manage Stores (Get list / Create new)
router.get('/stores', getStores);
router.post('/stores', createStoreValidator, validateFields, createStore);

module.exports = router;
