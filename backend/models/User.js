module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fullname: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      roles: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'User'
      },

      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      guardianName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      guardianPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      isSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      registerdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );

  return User;
};
