module.exports = (sequelize, DataTypes) => {
  const WeeklyLesson = sequelize.define(
    'WeeklyLesson',
    {
      lessonid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      scripture: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      bibleReading: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      lessonMessage: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      keyPoints: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      weekNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'weekly_lessons',
      timestamps: true
    }
  );

  return WeeklyLesson;
};
