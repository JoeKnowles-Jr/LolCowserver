const express = require('express');
const commentService = require('../services/comment.service');

const router = express.Router();

// GET /comments
router.get('/', async function (req, res) {
    res.json(await commentService.getAllComments());
});

// GET /comments/id/:cid
router.get('/id/:cid', async function (req, res) {
    res.json(await commentService.getCommentById(req.params.cid));
});

// GET /comments/user/:uid
router.get('/id/:uid', async function (req, res) {
    res.json(await commentService.getCommentsByUser(req.params.uid));
});

// GET /comments/comment/:cid
router.get('/id/:cid', async function (req, res) {
    res.json(await commentService.getCommentsByParent(req.params.cid));
});

// POST /comments
router.post('/', async function (req, res, next) {
    try {
        const comment = await commentService.insertComment(req.body);
        res.json({ comment });
    } catch (err) {
        console.error(`Error while saving comment: `, err.message);
        next(err);
    }
});

// PUT /comments/    - update a comment
router.put('/', async function (req, res) {
    try {
        const body = req.body || {};
        const commentId = body.commentId || (req.comment && req.comment.commentId);
        if (!commentId) return res.status(400).json({ message: 'commentId required' });

        const updated = await commentService.updateEvent(commentId, body);
        // updated may be an error-like object from the service
        if (updated && updated.message && updated.message.toLowerCase().includes('not found')) {
            return res.status(404).json(updated);
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'comment update failed' });
    }
});

// DELETE /comments/:cid - delete a comment by id (path parameter)
router.delete('/:cid', async function (req, res) {
    try {
        const cid = req.params.cid;
        if (!cid) return res.status(400).json({ message: 'commentId required' });

        const result = await commentService.deleteEvent(eid);
        if (result && result.message && result.message.toLowerCase().includes('not found')) {
            return res.status(404).json(result);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'comment delete failed' });
    }
});

module.exports = router;