const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Associations

// 1. A Store Owner (User) owns a single Store.
// A Store belongs to a Store Owner.
User.hasOne(Store, {
  foreignKey: 'ownerId',
  as: 'Store',
  onDelete: 'SET NULL',
});
Store.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'Owner',
});

// 2. A User submits many Ratings.
// A Rating belongs to a User.
User.hasMany(Rating, {
  foreignKey: 'userId',
  as: 'Ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
});

// 3. A Store receives many Ratings.
// A Rating belongs to a Store.
Store.hasMany(Rating, {
  foreignKey: 'storeId',
  as: 'Ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'Store',
});

module.exports = {
  User,
  Store,
  Rating,
};
