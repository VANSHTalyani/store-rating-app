const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db');

const sequelize = getSequelizeInstance();

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storeId'],
    },
  ],
});

module.exports = Rating;
