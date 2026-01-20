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
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      scripture: {
        type: DataTypes.STRING(100),
        allowNull: true
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
