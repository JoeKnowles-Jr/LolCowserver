const express = require('express');
const eventService = require('../services/event.service');

const router = express.Router();

// GET /events
router.get('/', async function (req, res) {
    res.json(await eventService.getAllEvents());
});

// GET /events/id/:eid
router.get('/id/:eid', async function (req, res) {
    res.json(await eventService.getEventById(req.params.eid));
});

// POST /events
router.post('/', async function (req, res, next) {
    try {
        const event = await eventService.insertEvent(req.body);
        res.json({ event });
    } catch (err) {
        console.error(`Error while saving event: `, err.message);
        next(err);
    }
});

// PUT /events/    - update an event
router.put('/', async function (req, res) {
    try {
        const body = req.body || {};
        const eventId = body.eventId || (req.event && req.event.eventId);
        if (!eventId) return res.status(400).json({ message: 'eventId required' });

        const updated = await eventService.updateEvent(eventId, body);
        // updated may be an error-like object from the service
        if (updated && updated.message && updated.message.toLowerCase().includes('not found')) {
            return res.status(404).json(updated);
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'event update failed' });
    }
});

// DELETE /events/:eid - delete an event by id (path parameter)
router.delete('/:eid', async function (req, res) {
    try {
        const eid = req.params.eid;
        if (!eid) return res.status(400).json({ message: 'eventId required' });

        const result = await eventService.deleteEvent(eid);
        if (result && result.message && result.message.toLowerCase().includes('not found')) {
            return res.status(404).json(result);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || 'event delete failed' });
    }
});

module.exports = router;