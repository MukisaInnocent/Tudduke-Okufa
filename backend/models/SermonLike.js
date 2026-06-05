const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SermonLike = sequelize.define('SermonLike', {
        likeid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sermonId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'sermon_likes',
        indexes: [
            {
                unique: true,
                fields: ['sermonId', 'userId']
            }
        ]
    });

    return SermonLike;
};
