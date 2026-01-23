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
const SermonComment = require('./SermonComment')(sequelize);
const SermonLike = require('./SermonLike')(sequelize);

// NEW MODELS
const SabbathSchoolClass = require('./SabbathSchoolClass')(sequelize, require('sequelize').DataTypes);
const TeacherResource = require('./TeacherResource')(sequelize, require('sequelize').DataTypes);
const ClassEvent = require('./ClassEvent')(sequelize, require('sequelize').DataTypes);

const ResourceView = require('./ResourceView')(sequelize, require('sequelize').DataTypes);

// ASSOCIATIONS
User.hasMany(SermonComment, { foreignKey: 'userId' });
SermonComment.belongsTo(User, { foreignKey: 'userId' });

Sermon.hasMany(SermonComment, { foreignKey: 'sermonId', onDelete: 'CASCADE' });
SermonComment.belongsTo(Sermon, { foreignKey: 'sermonId' });

User.belongsToMany(Sermon, { through: SermonLike, foreignKey: 'userId' });
Sermon.belongsToMany(User, { through: SermonLike, foreignKey: 'sermonId' });

Sermon.hasMany(SermonLike, { foreignKey: 'sermonId' });
SermonLike.belongsTo(Sermon, { foreignKey: 'sermonId' });

// TEACHER / CLASS ASSOCIATIONS
User.hasMany(SabbathSchoolClass, { foreignKey: 'teacherId' });
SabbathSchoolClass.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

// Students in Class
// SabbathSchoolClass.hasMany(User, { as: 'students', foreignKey: 'classId' });
// User.belongsTo(SabbathSchoolClass, { as: 'class', foreignKey: 'classId' });

// Resources
User.hasMany(TeacherResource, { foreignKey: 'uploadedBy' });
TeacherResource.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Events
SabbathSchoolClass.hasMany(ClassEvent, { foreignKey: 'classId' });
ClassEvent.belongsTo(SabbathSchoolClass, { foreignKey: 'classId' });

// Resource Views
User.hasMany(ResourceView, { foreignKey: 'userId' });
ResourceView.belongsTo(User, { foreignKey: 'userId' });

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
  ActivityLog,
  SermonComment,
  SermonLike,
  SabbathSchoolClass,
  TeacherResource,
  ClassEvent,
  ResourceView
};
