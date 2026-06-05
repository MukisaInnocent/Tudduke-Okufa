module.exports = (sequelize, DataTypes) => {
    const QuizTopic = sequelize.define(
        'QuizTopic',
        {
            topicid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(300),
                allowNull: true
            },
            imageUrl: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userid'
                }
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'quiz_topics',
            timestamps: true
        }
    );

    return QuizTopic;
};
