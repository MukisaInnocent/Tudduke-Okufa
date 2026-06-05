module.exports = (sequelize, DataTypes) => {
    const SabbathSchoolClass = sequelize.define(
        'SabbathSchoolClass',
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
            ageGroup: {
                type: DataTypes.STRING(50),
                allowNull: true // e.g., "Kindergarten (4-6)"
            },
            teacherId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'userid'
                }
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'sabbath_school_classes',
            timestamps: false
        }
    );

    return SabbathSchoolClass;
};
