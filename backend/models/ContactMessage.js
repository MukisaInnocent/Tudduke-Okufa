module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ContactMessage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      message: {
        type: DataTypes.STRING(1000),
        allowNull: false
      }
    },
    {
      tableName: 'contact_messages',
      timestamps: true
    }
  );
};
