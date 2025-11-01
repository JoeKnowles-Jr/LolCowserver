const Comment = (sequelize, DataTypes) => {
    return sequelize.define('Comment', {
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        commentTitle: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true
        },
        commentBody: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true
        },
        commentLikes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 0
        },
        commentDislikes: {
            type: DataTypes.INTEGER,
            allowNull: true,
            default: 0
        },
    }, {
        timestamps: true,
        tableName: 'comments'
    });
}

module.exports = Comment;