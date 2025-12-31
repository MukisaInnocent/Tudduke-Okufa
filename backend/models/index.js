const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false
  }
});

const User = require('./User')(sequelize, DataTypes);
const Sermon = require('./Sermon')(sequelize, DataTypes);
const ContactMessage = require('./ContactMessage')(sequelize, DataTypes);

/* =========================
   RELATIONSHIPS
========================= */
User.hasMany(Sermon, {
  foreignKey: 'authorid',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Sermon.belongsTo(User, {
  foreignKey: 'authorid'
});

module.exports = {
  sequelize,
  User,
  Sermon,
  ContactMessage
};
