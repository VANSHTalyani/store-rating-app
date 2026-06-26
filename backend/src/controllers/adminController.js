const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { getSequelizeInstance } = require('../config/db');
const { User, Store, Rating } = require('../models');

const sequelize = getSequelizeInstance();

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error fetching statistics.' });
  }
};

// Create a User (Admin, User, or Store Owner)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if role is valid
    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error creating user.' });
  }
};

// Create a Store (and associate with Owner)
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store email already exists
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'A store with this email address already exists.' });
    }

    // If ownerId is provided, validate owner
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(404).json({ message: 'Store owner user not found.' });
      }

      if (owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'The designated owner must have the store_owner role.' });
      }

      // Check if this owner already owns a store
      const existingOwnedStore = await Store.findOne({ where: { ownerId } });
      if (existingOwnedStore) {
        return res.status(400).json({ message: 'The designated store owner already owns a store.' });
      }
    }

    // Create store
    const newStore = await Store.create({
      name,
      email,
      address,
      ownerId: ownerId || null,
    });

    res.status(201).json({
      message: 'Store created successfully.',
      store: newStore,
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Internal server error creating store.' });
  }
};

// View list of Users (includes filtering & sorting)
const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy, sortOrder } = req.query;

    // Build filters
    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'storeRating'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause;
    if (activeSortField === 'storeRating') {
      orderClause = [[sequelize.literal('storeRating'), activeSortOrder]];
    } else {
      orderClause = [[activeSortField, activeSortOrder]];
    }

    // Subquery to calculate store average rating for users of role 'store_owner'
    // It selects the average rating of the store owned by the user.
    const storeRatingSubquery = `(
      SELECT COALESCE(AVG(r.rating), 0)
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.storeId
      WHERE s.ownerId = User.id
    )`;

    const users = await User.findAll({
      attributes: [
        'id', 'name', 'email', 'address', 'role', 'createdAt',
        [sequelize.literal(storeRatingSubquery), 'storeRating']
      ],
      where: whereClause,
      order: orderClause,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error fetching users.' });
  }
};

// View list of Stores (includes filtering & sorting)
const getStores = async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;

    // Build filters
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build sorting
    const validSortFields = ['name', 'email', 'address', 'averageRating'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause;
    if (activeSortField === 'averageRating') {
      orderClause = [[sequelize.literal('averageRating'), activeSortOrder]];
    } else {
      orderClause = [[activeSortField, activeSortOrder]];
    }

    // Subquery to get store average rating
    const averageRatingSubquery = `(
      SELECT COALESCE(AVG(r.rating), 0)
      FROM ratings r
      WHERE r.storeId = Store.id
    )`;

    const stores = await Store.findAll({
      attributes: [
        'id', 'name', 'email', 'address', 'ownerId', 'createdAt',
        [sequelize.literal(averageRatingSubquery), 'averageRating']
      ],
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'name', 'email'],
        }
      ],
      where: whereClause,
      order: orderClause,
    });

    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error fetching stores.' });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
};
