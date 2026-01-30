module.exports = (sequelize, DataTypes) => {
  const QuizQuestion = sequelize.define(
    'QuizQuestion',
    {
      questionid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      question: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      option1: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      option2: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      option3: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      correctAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '1, 2, or 3 indicating which option is correct'
      },
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'quiz_topics',
          key: 'topicid'
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'quiz_questions',
      timestamps: true
    }
  );

  return QuizQuestion;
};
