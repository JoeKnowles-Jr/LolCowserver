const router = require("express").Router();
const users = require('../services/user.service');

router.get('/', async function(req, res) {
    res.json(await users.getAllUsers());
});

router.get('/:username', async function(req, res) {
    res.json(await users.getSingleByUsername(req.params.username));
});

router.get('/id/:uid', async function(req, res) {
    res.json(await users.getSingleById(req.params.uid));
});

router.post('/', async function(req, res, next) {
    try {
        res.json(await users.insertUser(req.body));
    } catch (err) {
        console.error(`Error while saving product: `, err.message);
        next(err);        
    } 
});

module.exports = router;