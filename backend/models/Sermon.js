module.exports = (sequelize, DataTypes) => {
  const Sermon = sequelize.define(
    'Sermon',
    {
      sermonid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      topic: {
        type: DataTypes.STRING(100)
      },
      title: {
        type: DataTypes.STRING(100),
        unique: true
      },
      scripture: {
        type: DataTypes.STRING(50)
      },
      explanation: {
        type: DataTypes.STRING(1000)
      },
      examples: {
        type: DataTypes.STRING(1000)
      },
      authorid: {
        type: DataTypes.INTEGER
      },
      entrytime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'sermons',
      timestamps: false
    }
  );

  return Sermon;
};
