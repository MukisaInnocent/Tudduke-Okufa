module.exports = (sequelize, DataTypes) => {
  const Donation = sequelize.define(
    'Donation',
    {
      donationid: {
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
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'UGX'
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      paymentDetails: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'donations',
      timestamps: true
    }
  );

  return Donation;
};
