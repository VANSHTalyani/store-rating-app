const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Authorization header expected as: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing or invalid.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'super_secret_store_rating_key_12345');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token expired or unauthorized.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden. Administrator privileges required.' });
  }
};

const requireNormalUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden. Normal User privileges required.' });
  }
};

const requireStoreOwner = (req, res, next) => {
  if (req.user && req.user.role === 'store_owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden. Store Owner privileges required.' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireNormalUser,
  requireStoreOwner,
};
