module.exports = (sequelize, DataTypes) => {
    const QuizResult = sequelize.define(
        'QuizResult',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            kidId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'userid'
                }
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            total: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            takenAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: 'quiz_results',
            timestamps: false
        }
    );

    return QuizResult;
};
