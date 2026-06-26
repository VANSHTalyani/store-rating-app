const express = require('express');
const { body } = require('express-validator');
const { getStoresForUser, submitOrModifyRating } = require('../controllers/userController');
const { authenticateToken, requireNormalUser } = require('../middleware/auth');
const { validateFields } = require('../middleware/validate');

const router = express.Router();

// Apply auth and user check to all user routes
router.use(authenticateToken, requireNormalUser);

const ratingValidator = [
  body('storeId')
    .isInt()
    .withMessage('Store ID must be an integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

// Get list of stores (with custom search, sorting, and user-specific ratings)
router.get('/stores', getStoresForUser);

// Submit or edit rating for a store
router.post('/ratings', ratingValidator, validateFields, submitOrModifyRating);

module.exports = router;
