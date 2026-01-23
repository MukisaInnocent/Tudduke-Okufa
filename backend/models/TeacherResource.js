module.exports = (sequelize, DataTypes) => {
    const TeacherResource = sequelize.define(
        'TeacherResource',
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
            type: {
                type: DataTypes.STRING(20), // 'pdf', 'video', 'image', 'other'
                allowNull: false
            },
            fileUrl: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            uploadedBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userid'
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
            tableName: 'teacher_resources',
            timestamps: false
        }
    );

    return TeacherResource;
};
