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
        type: DataTypes.TEXT,
        allowNull: true
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      authorid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      entrytime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, approved, rejected
      },
      verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'sermons',
      timestamps: false
    }
  );

  return Sermon;
};
