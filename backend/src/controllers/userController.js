const { Op } = require('sequelize');
const { getSequelizeInstance } = require('../config/db');
const { Store, Rating } = require('../models');

const sequelize = getSequelizeInstance();

// Get list of all stores for Normal User
const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, sortBy, sortOrder } = req.query;

    // Filter by name or address
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build sorting
    const validSortFields = ['name', 'address', 'averageRating', 'userRating'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause;
    if (activeSortField === 'averageRating') {
      orderClause = [[sequelize.literal('averageRating'), activeSortOrder]];
    } else if (activeSortField === 'userRating') {
      orderClause = [[sequelize.literal('userRating'), activeSortOrder]];
    } else {
      orderClause = [[activeSortField, activeSortOrder]];
    }

    // Subquery for store average rating
    const averageRatingSubquery = `(
      SELECT COALESCE(AVG(r.rating), 0)
      FROM ratings r
      WHERE r.storeId = Store.id
    )`;

    // Subquery for the specific user's submitted rating
    const userRatingSubquery = `(
      SELECT r.rating
      FROM ratings r
      WHERE r.storeId = Store.id AND r.userId = ${sequelize.escape(userId)}
      LIMIT 1
    )`;

    const stores = await Store.findAll({
      attributes: [
        'id', 'name', 'email', 'address',
        [sequelize.literal(averageRatingSubquery), 'averageRating'],
        [sequelize.literal(userRatingSubquery), 'userRating']
      ],
      where: whereClause,
      order: orderClause,
    });

    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores for user:', error);
    res.status(500).json({ message: 'Internal server error fetching stores.' });
  }
};

// Submit or Modify rating
const submitOrModifyRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Find if user already rated this store
    let userRating = await Rating.findOne({ where: { userId, storeId } });

    if (userRating) {
      // Modify existing rating
      userRating.rating = rating;
      await userRating.save();
      return res.status(200).json({
        message: 'Rating updated successfully.',
        rating: userRating,
      });
    } else {
      // Create new rating
      userRating = await Rating.create({
        userId,
        storeId,
        rating,
      });
      return res.status(201).json({
        message: 'Rating submitted successfully.',
        rating: userRating,
      });
    }
  } catch (error) {
    console.error('Error submitting/modifying rating:', error);
    res.status(500).json({ message: 'Internal server error submitting rating.' });
  }
};

module.exports = {
  getStoresForUser,
  submitOrModifyRating,
};
