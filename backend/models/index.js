const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both DATABASE_URL and individual connection parameters
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (for production/cloud databases)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? { require: true, rejectUnauthorized: false }
          : false
    }
  });
} else {
  // Use individual parameters for local development
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tudduke_okufa',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: false
    }
  };

  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions
    }
  );
}

const ContactMessage = require('./ContactMessage')(sequelize);
const Sermon = require('./Sermon')(sequelize, require('sequelize').DataTypes);
const WeeklyLesson = require('./WeeklyLesson')(sequelize, require('sequelize').DataTypes);
const MemoryVerse = require('./MemoryVerse')(sequelize, require('sequelize').DataTypes);
const ChildrenSermon = require('./ChildrenSermon')(sequelize, require('sequelize').DataTypes);
const QuizQuestion = require('./QuizQuestion')(sequelize, require('sequelize').DataTypes);
const Donation = require('./Donation')(sequelize, require('sequelize').DataTypes);
const User = require('./User')(sequelize, require('sequelize').DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, require('sequelize').DataTypes);

module.exports = {
  sequelize,
  ContactMessage,
  Sermon,
  WeeklyLesson,
  MemoryVerse,
  ChildrenSermon,
  QuizQuestion,
  Donation,
  User,
  ActivityLog
};
