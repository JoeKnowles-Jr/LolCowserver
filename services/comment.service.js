
const helper = require('../helper');
const { sequelize, Comment } = require('../models');

async function getAllComments() {
    try {
        // ensure DB connection (optional if you already connect on startup)
        await sequelize.authenticate();

        const comments = await Comment.findAll();

        return helper.emptyOrData(comments);
    } catch (err) {
        console.error(err);
        return ({ message: 'Failed to fetch comments' });
    }
}

async function getCommentById(cid) {
    try {
        await sequelize.authenticate();
        const comment = await Comment.findByPk(cid);
        return helper.emptyOrData(comment);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch comment' };
    }
}

async function getCommentsByParent(cid) {
    try {
        await sequelize.authenticate();
        const comments = await Comment.findAll({ where: { parentId: cid } });
        return helper.emptyOrData(comments);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch comments' };
    }
}

async function getCommentsByUser(uid) {
    try {
        await sequelize.authenticate();
        const comments = await Comment.findAll({ where: { userId: uid } });
        return helper.emptyOrData(comments);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch comments' };
    }
}

async function insertComment(c) {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const comment = await Comment.create({
            eventId: c.eventId,
            parentId: c.parentId,
            userId: c.userId,
            commentTitle: c.commentTitle,
            commentBody: c.commentBody,
            commentLikes: 0,
            commentDislikes: 0
        });
        return ({ 'Created comment:': comment.toJSON() });
    } catch (err) {
        console.error(err);
        return ({ type: "Error", message: err });
    } finally {
        await sequelize.close();
    }
}

async function updateComment(cid, changes) {
    try {
        await sequelize.authenticate();

        const comment = await Comment.findByPk(cid);
        if (!comment) return { message: 'Comment not found' };

        // Only allow updating these fields
        const allowed = ['eventId', 'parentId', 'userId', 'commentTitle', 'commentBody', 'commentLikes', 'commentDislikes'];
        const toUpdate = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(changes, key)) {
                toUpdate[key] = changes[key];
            }
        }

        if (Object.keys(toUpdate).length === 0) {
            return { message: 'No valid fields to update' };
        }

        await comment.update(toUpdate);

        const plain = comment.get({ plain: true });
        return helper.emptyOrData(plain);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to update comment' };
    }
}

async function deleteComment(cid) {
    try {
        await sequelize.authenticate();

        const comment = await Comment.findByPk(cid);
        if (!comment) return { message: 'Comment not found' };

        await comment.destroy();
        return { message: 'Comment deleted' };
    } catch (err) {
        console.error(err);
        return { message: 'Failed to delete comment' };
    }
}

module.exports = {
    getAllComments,
    getCommentById,
    getCommentsByParent,
    getCommentsByUser,
    insertComment,
    updateComment,
    deleteComment
};
