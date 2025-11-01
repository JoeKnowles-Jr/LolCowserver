const express = require('express');
const betService = require('../services/bet.service');

const router = express.Router();

// GET /bets
router.get('/', async function (req, res) {
    res.json(await betService.getAllBets());
});

// GET /bets/id/:bid
router.get('/id/:bid', async function (req, res) {
    res.json(await betService.getBetById(req.params.bid));
});

// GET /bets/user/:uid
router.get('/user/:uid', async function (req, res) {
    res.json(await betService.getBetsByUser(req.params.uid));
});

// POST /bets
router.post('/', async function (req, res, next) {
    try {
        const bet = await betService.insertBet(req.body);
        res.json({ bet });
    } catch (err) {
        console.error(`Error while saving bet: `, err.message);
        next(err);
    }
});

// PUT /bets/    - update a bet
router.put('/', async function (req, res) {
    try {
        const body = req.body || {};
        const betId = body.betId || (req.bet && req.bet.betId);
        if (!eventId) return res.status(400).json({ message: 'betId required' });

        const updated = await betService.updateEvent(betId, body);
        // updated may be an error-like object from the service
        if (updated && updated.message && updated.message.toLowerCase().includes('not found')) {
            return res.status(404).json(updated);
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'bet update failed' });
    }
});

// DELETE /bets/:bid - delete an event by id (path parameter)
router.delete('/:bid', async function (req, res) {
    try {
        const bid = req.params.bid;
        if (!bid) return res.status(400).json({ message: 'betId required' });

        const result = await betService.deleteBet(bid);
        if (result && result.message && result.message.toLowerCase().includes('not found')) {
            return res.status(404).json(result);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'bet delete failed' });
    }
});

module.exports = router;