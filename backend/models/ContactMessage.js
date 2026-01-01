module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'contact_messages', // 👈 model name = table name
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
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      timestamps: true,
      freezeTableName: true // 👈 VERY IMPORTANT
    }
  );
};
