const express = require('express');
const fileUpload = require('express-fileupload');
const userService = require('../services/user.service');

const router = express.Router();

router.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}));

// GET /users
router.get('/', async function (req, res) {
    res.json(await userService.getAllUsers());
});

// GET /users/:username
router.get('/:username', async function (req, res) {
    res.json(await userService.getSingleByUsername(req.params.username));
});

// GET /users/id/:uid
router.get('/id/:uid', async function (req, res) {
    res.json(await userService.getSingleById(req.params.uid));
});

// GET /users/profile/:pid
router.get('/profile/:pid', async function (req, res) {
    res.json(await userService.getProfileById(req.params.pid));
});

router.post('/', async function (req, res, next) {
    // res.json(req.body);
    try {
        const user = await userService.insertUser(req.body);
        res.json({user});
    } catch (err) {
        console.error(`Error while saving user: `, err.message);
        next(err);        
    } 
});

// POST /users/profile - create a new profile (uses insertUser in services)
router.post('/profile', async function (req, res) {
    try {
        const payload = req.body || {};
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({ message: 'Request body required' });
        }

        const created = await userService.insertProfile(payload);
        return res.status(201).json(created);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'failed to create profile' });
    }
});

// POST /users/profile/avatar
// expects: form-data with field "avatar" and either body.userId or authenticated req.user.id
router.post('/profile/avatar', async (req, res) => {
    try {
        const file = req.files && req.files.avatar;
        const userId = req.body.userId || (req.user && req.user.id);

        if (!userId) return res.status(400).json({ message: 'userId required' });
        if (!file) return res.status(400).json({ message: 'avatar file required' });

        const avatarUrl = await userService.uploadAvatar(userId, file);
        return res.json({ avatarUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'upload failed' });
    }
});

// PUT /users/    - update a user
router.put('/', async function (req, res) {
    try {
        const body = req.body || {};
        const userId = body.userId || (req.user && req.user.userId);
        if (!userId) return res.status(400).json({ message: 'userId required' });

        const updated = await userService.updateUser(userId, body);
        // updated may be an error-like object from the service
        if (updated && updated.message && updated.message.toLowerCase().includes('not found')) {
            return res.status(404).json(updated);
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'update failed' });
    }
});

// PUT /users/    - update a user
router.put('/profile', async function (req, res) {
    try {
        const body = req.body || {};
        const profileId = body.profileId || (req.user && req.user.profileId);
        if (!profileId) return res.status(400).json({ message: 'profileId required' });

        const updated = await userService.updateProfile(profileId, body);
        // updated may be an error-like object from the service
        if (updated && updated.message && updated.message.toLowerCase().includes('not found')) {
            return res.status(404).json(updated);
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'update failed' });
    }
});

// DELETE /users/:uid - delete a user by id (path parameter)
router.delete('/:uid', async function (req, res) {
    try {
        const uid = req.params.uid;
        if (!uid) return res.status(400).json({ message: 'userId required' });

        const result = await userService.deleteUser(uid);
        if (result && result.message && result.message.toLowerCase().includes('not found')) {
            return res.status(404).json(result);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'delete failed' });
    }
});

module.exports = router;