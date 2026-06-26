const bcrypt = require('bcryptjs');
const { initDatabase, getSequelizeInstance } = require('../config/db');
const { User, Store, Rating } = require('../models');

const seed = async () => {
  try {
    // 1. Initialise connection and create database if missing
    await initDatabase();

    const sequelize = getSequelizeInstance();
    // Sync models (force sync to rebuild for clean seed)
    await sequelize.sync({ force: true });
    console.log('Database schema synchronized successfully.');

    // 2. Hash passwords
    const adminPassword = await bcrypt.hash('Admin@12345!', 10);
    const ownerPassword = await bcrypt.hash('Owner@12345!', 10);
    const userPassword = await bcrypt.hash('User@12345!', 10);

    // 3. Create Users (Names must be 20-60 characters, Passwords must be validly hashed)
    console.log('Seeding users...');
    const admin = await User.create({
      name: 'System Administrator User', // 27 chars
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '123 Admin Headquarter Avenue, Suite 100',
      role: 'admin',
    });

    const owner1 = await User.create({
      name: 'Store Owner Account One', // 23 chars
      email: 'owner1@storerating.com',
      password: ownerPassword,
      address: '456 Owner Boulevard, Store 101',
      role: 'store_owner',
    });

    const owner2 = await User.create({
      name: 'Store Owner Account Two', // 23 chars
      email: 'owner2@storerating.com',
      password: ownerPassword,
      address: '789 Owner Boulevard, Store 102',
      role: 'store_owner',
    });

    const normalUser = await User.create({
      name: 'Normal Test User Account', // 24 chars
      email: 'user@storerating.com',
      password: userPassword,
      address: '321 User Residential Circle, Apt 4',
      role: 'user',
    });

    console.log('Seeding stores...');
    // 4. Create Stores (Names 20-60 chars)
    const store1 = await Store.create({
      name: 'Tech Solutions Superstore', // 25 chars
      email: 'techstore@storerating.com',
      address: '100 Tech Lane, Silicon Valley',
      ownerId: owner1.id,
    });

    const store2 = await Store.create({
      name: 'Organic Groceries Emporium', // 26 chars
      email: 'organicstore@storerating.com',
      address: '200 Green Road, Organic City',
      ownerId: owner2.id,
    });

    console.log('Seeding ratings...');
    // 5. Create Ratings (between 1 and 5)
    await Rating.create({
      userId: normalUser.id,
      storeId: store1.id,
      rating: 5,
    });

    await Rating.create({
      userId: normalUser.id,
      storeId: store2.id,
      rating: 4,
    });

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during database seeding:', error);
    process.exit(1);
  }
};

seed();
