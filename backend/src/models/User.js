const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db');

const sequelize = getSequelizeInstance();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60], // Min 20, Max 60 characters
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400], // Max 400 characters
    },
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'store_owner'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
