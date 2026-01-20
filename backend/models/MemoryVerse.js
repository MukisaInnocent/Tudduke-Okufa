module.exports = (sequelize, DataTypes) => {
  const MemoryVerse = sequelize.define(
    'MemoryVerse',
    {
      verseid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      reference: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      dayOfWeek: {
        type: DataTypes.STRING(20),
        allowNull: true
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
      tableName: 'memory_verses',
      timestamps: true
    }
  );

  return MemoryVerse;
};
