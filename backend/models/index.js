const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');

// Using SQLite for Render (Ephemeral Storage) or local development
let sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

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
const PreacherResource = require('./PreacherResource')(sequelize, require('sequelize').DataTypes);
const ClassEvent = require('./ClassEvent')(sequelize, require('sequelize').DataTypes);

const ResourceView = require('./ResourceView')(sequelize, require('sequelize').DataTypes);
const QuizResult = require('./QuizResult')(sequelize, require('sequelize').DataTypes);
const QuizTopic = require('./QuizTopic')(sequelize, require('sequelize').DataTypes);

// ASSOCIATIONS
User.hasMany(SermonComment, { foreignKey: 'userId' });
SermonComment.belongsTo(User, { foreignKey: 'userId' });

Sermon.hasMany(SermonComment, { foreignKey: 'sermonId', onDelete: 'CASCADE' });
SermonComment.belongsTo(Sermon, { foreignKey: 'sermonId' });

User.belongsToMany(Sermon, { through: SermonLike, foreignKey: 'userId' });
Sermon.belongsToMany(User, { through: SermonLike, foreignKey: 'sermonId' });

Sermon.hasMany(SermonLike, { foreignKey: 'sermonId' });
SermonLike.belongsTo(Sermon, { foreignKey: 'sermonId' });

User.hasMany(Sermon, { foreignKey: 'authorid' });
Sermon.belongsTo(User, { as: 'author', foreignKey: 'authorid' });
Sermon.belongsTo(User, { as: 'verifier', foreignKey: 'verifiedBy' });

// TEACHER / CLASS ASSOCIATIONS
User.hasMany(SabbathSchoolClass, { foreignKey: 'teacherId' });
SabbathSchoolClass.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

// Students in Class
// SabbathSchoolClass.hasMany(User, { as: 'students', foreignKey: 'classId' });
// User.belongsTo(SabbathSchoolClass, { as: 'class', foreignKey: 'classId' });
// Resources
User.hasMany(TeacherResource, { foreignKey: 'uploadedBy' });
TeacherResource.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Preacher Resources
User.hasMany(PreacherResource, { foreignKey: 'uploadedBy' });
PreacherResource.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Events
User.hasMany(ClassEvent, { foreignKey: 'createdBy' });
ClassEvent.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
// ClassEvent belongs to Class
SabbathSchoolClass.hasMany(ClassEvent, { foreignKey: 'classId' });
ClassEvent.belongsTo(SabbathSchoolClass, { foreignKey: 'classId' });

// Resource Views
User.hasMany(ResourceView, { foreignKey: 'userId' });
ResourceView.belongsTo(User, { foreignKey: 'userId' });

// Quiz Topics & Questions
User.hasMany(QuizTopic, { foreignKey: 'createdBy' });
QuizTopic.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

QuizTopic.hasMany(QuizQuestion, { foreignKey: 'topicId' });
QuizQuestion.belongsTo(QuizTopic, { foreignKey: 'topicId' });

// Quiz Results
User.hasMany(QuizResult, { foreignKey: 'kidId' });
QuizResult.belongsTo(User, { foreignKey: 'kidId' });

// Memory Verses
User.hasMany(MemoryVerse, { foreignKey: 'createdBy' });
MemoryVerse.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

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
  PreacherResource,
  ClassEvent,
  ResourceView,
  QuizResult,
  QuizTopic
};
