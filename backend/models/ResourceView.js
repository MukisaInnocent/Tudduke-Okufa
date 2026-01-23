module.exports = (sequelize, DataTypes) => {
    const ResourceView = sequelize.define(
        'ResourceView',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userid'
                }
            },
            resourceId: {
                type: DataTypes.INTEGER,
                allowNull: true // If null, maybe it's a generic page view
            },
            resourceType: {
                type: DataTypes.STRING(50), // 'teacher_resource', 'sermon', 'lesson'
                allowNull: false
            },
            viewedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'resource_views',
            timestamps: false
        }
    );

    return ResourceView;
};
