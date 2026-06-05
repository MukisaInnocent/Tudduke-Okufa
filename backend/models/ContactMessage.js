const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'ContactMessage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: 'contact_messages',
      timestamps: true
    }
  );
};
