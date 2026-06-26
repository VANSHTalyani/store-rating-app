const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/db');

const sequelize = getSequelizeInstance();

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60], // Name: Min 20, Max 60 characters
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
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400], // Address: Max 400 characters
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'stores',
  timestamps: true,
});

module.exports = Store;
