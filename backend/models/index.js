const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { require: true, rejectUnauthorized: false }
        : false
  }
});

const ContactMessage = require('./ContactMessage')(sequelize);

module.exports = {
  sequelize,
  ContactMessage
};
