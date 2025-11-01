
const helper = require('../helper');
const { sequelize, Event } = require('../models');

async function getAllEvents() {
    try {
        // ensure DB connection (optional if you already connect on startup)
        await sequelize.authenticate();

        const events = await Event.findAll();

        return helper.emptyOrData(events);
    } catch (err) {
        console.error(err);
        return ({ message: 'Failed to fetch events' });
    }
}

async function getEventById(eid) {
    try {
        await sequelize.authenticate();
        const event = await Event.findByPk(eid);
        return helper.emptyOrData(event);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch event' };
    }
}

async function insertEvent(e) {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const event = await Event.create({
            eventType: e.eventType,
            eventTopic: e.eventTopic,
            eventStatus: e.eventStatus
        });
        return ({ 'Created event:': event.toJSON() });
    } catch (err) {
        console.error(err);
        return ({ type: "Error", message: err });
    } finally {
        await sequelize.close();
    }
}

async function updateEvent(eid, changes) {
    try {
        await sequelize.authenticate();

        const event = await Event.findByPk(uid);
        if (!event) return { message: 'Event not found' };

        // Only allow updating these fields
        const allowed = ['eventType', 'eventTopic', 'eventStatus'];
        const toUpdate = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(changes, key)) {
                toUpdate[key] = changes[key];
            }
        }

        if (Object.keys(toUpdate).length === 0) {
            return { message: 'No valid fields to update' };
        }

        await event.update(toUpdate);

        const plain = event.get({ plain: true });
        return helper.emptyOrData(plain);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to update event' };
    }
}

async function deleteEvent(eid) {
    try {
        await sequelize.authenticate();

        const event = await Event.findByPk(eid);
        if (!event) return { message: 'Event not found' };

        await user.destroy();
        return { message: 'User deleted' };
    } catch (err) {
        console.error(err);
        return { message: 'Failed to delete user' };
    }
}

module.exports = {
    getAllEvents,
    getEventById,
    insertEvent,
    updateEvent,
    deleteEvent
};
