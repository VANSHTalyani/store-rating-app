const { getSequelizeInstance } = require('../config/db');
const { Store, Rating, User } = require('../models');

const sequelize = getSequelizeInstance();

// Get Owner Store Dashboard Stats and Reviewers List
const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy, sortOrder } = req.query;

    // 1. Find the store owned by this user
    const store = await Store.findOne({ where: { ownerId: userId } });
    if (!store) {
      return res.status(200).json({
        hasStore: false,
        message: 'No store is currently associated with this owner account.',
      });
    }

    // 2. Build sorting
    const validSortFields = ['userName', 'userEmail', 'rating'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'rating';
    const activeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause;
    if (activeSortField === 'userName') {
      orderClause = [[{ model: User, as: 'User' }, 'name', activeSortOrder]];
    } else if (activeSortField === 'userEmail') {
      orderClause = [[{ model: User, as: 'User' }, 'email', activeSortOrder]];
    } else {
      orderClause = [['rating', activeSortOrder]];
    }

    // 3. Fetch ratings for this store, including User info
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
      order: orderClause,
    });

    // 4. Calculate average rating
    const ratingStats = await Rating.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      ],
      where: { storeId: store.id },
    });

    const averageRating = ratingStats ? parseFloat(ratingStats.getDataValue('averageRating')) || 0 : 0;

    res.status(200).json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(averageRating.toFixed(2)),
      },
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        user: r.User ? {
          id: r.User.id,
          name: r.User.name,
          email: r.User.email,
          address: r.User.address,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    res.status(500).json({ message: 'Internal server error fetching dashboard.' });
  }
};

module.exports = {
  getOwnerDashboard,
};
