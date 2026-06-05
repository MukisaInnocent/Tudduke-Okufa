module.exports = (sequelize, DataTypes) => {
    const ClassEvent = sequelize.define(
        'ClassEvent',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            title: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            eventDate: {
                type: DataTypes.DATE, // Includes time
                allowNull: false
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userid'
                }
            },
            classId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'sabbath_school_classes',
                    key: 'id'
                }
            },
            status: {
                type: DataTypes.STRING(20),
                defaultValue: 'pending' // pending, approved, rejected
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'class_events',
            timestamps: false
        }
    );

    return ClassEvent;
};
