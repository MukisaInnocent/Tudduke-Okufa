module.exports = (sequelize, DataTypes) => {
  const ChildrenSermon = sequelize.define(
    'ChildrenSermon',
    {
      sermonid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      videoUrl: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      teacherName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'children_sermons',
      timestamps: true
    }
  );

  return ChildrenSermon;
};
