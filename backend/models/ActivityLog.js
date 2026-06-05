module.exports = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define(
        'ActivityLog',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true // Null means "Guest" or System action
            },
            action: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            details: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            ipAddress: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'activity_logs',
            timestamps: false
        }
    );

    return ActivityLog;
};
