const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

let sequelize;

const initDatabase = async () => {
  try {
    // Connect to MySQL server without selecting a database first
    const connection = await mysql.createConnection({
      host: DB_HOST || '127.0.0.1',
      port: DB_PORT || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Create database if it does not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'store_rating_db'}\`;`);
    await connection.end();

    console.log(`Database '${DB_NAME || 'store_rating_db'}' verified/created successfully.`);
  } catch (error) {
    console.error('Error pre-initializing MySQL database:', error.message);
  }
};

const getSequelizeInstance = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      DB_NAME || 'store_rating_db',
      DB_USER || 'root',
      DB_PASSWORD || '',
      {
        host: DB_HOST || '127.0.0.1',
        port: DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Set to console.log to debug SQL queries
        dialectOptions: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? {
          ssl: {
            rejectUnauthorized: false
          }
        } : undefined,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }
  return sequelize;
};

module.exports = {
  initDatabase,
  getSequelizeInstance,
};
