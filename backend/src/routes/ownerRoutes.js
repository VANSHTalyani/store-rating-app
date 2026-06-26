const express = require('express');
const { getOwnerDashboard } = require('../controllers/ownerController');
const { authenticateToken, requireStoreOwner } = require('../middleware/auth');

const router = express.Router();

// Apply auth and store owner check to all owner routes
router.use(authenticateToken, requireStoreOwner);

// Fetch store owner dashboard (stats + list of user reviews)
router.get('/dashboard', getOwnerDashboard);

module.exports = router;
