const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SermonComment = sequelize.define('SermonComment', {
        commentid: {
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
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'sermon_comments'
    });

    return SermonComment;
};
