
const helper = require('../helper');
const { sequelize, Bet } = require('../models');

async function getAllBets() {
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

async function getBetById(bid) {
    try {
        await sequelize.authenticate();
        const bet = await Bet.findByPk(bid);
        return helper.emptyOrData(bet);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch bet' };
    }
}

async function getBetsByEvent(eid) {
    try {
        await sequelize.authenticate();
        const bets = await Bet.findAll({ where: { eventId: eid } });
        return helper.emptyOrData(bets);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch bets' };
    }
}

async function getBetsByUser(uid) {
    try {
        await sequelize.authenticate();
        const bets = await Bet.findAll({ where: { userId: uid } });
        return helper.emptyOrData(bets);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch bets' };
    }
}

async function insertBet(b) {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const bet = await Bet.create({
            eventId: b.eventId,
            betType: b.betType,
            betAmount: b.betAmount,
            betOdds: b.betOdds,
            betPotentialPayout: b.betPotentialPayout,
            betStatus: b.betStatus
        });
        return ({ 'Created bet:': bet.toJSON() });
    } catch (err) {
        console.error(err);
        return ({ type: "Error", message: err });
    } finally {
        await sequelize.close();
    }
}

async function updateBet(bid, changes) {
    try {
        await sequelize.authenticate();

        const bet = await Bet.findByPk(bid);
        if (!bet) return { message: 'Bet not found' };

        // Only allow updating these fields
        const allowed = ['eventId', 'betType', 'betAmount', 'betOdds', 'betPotentialPayout', 'betStatus'];
        const toUpdate = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(changes, key)) {
                toUpdate[key] = changes[key];
            }
        }

        if (Object.keys(toUpdate).length === 0) {
            return { message: 'No valid fields to update' };
        }

        await bet.update(toUpdate);

        const plain = bet.get({ plain: true });
        return helper.emptyOrData(plain);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to update bet' };
    }
}

async function deleteBet(bid) {
    try {
        await sequelize.authenticate();

        const bet = await Bet.findByPk(bid);
        if (!bet) return { message: 'Bet not found' };

        await bet.destroy();
        return { message: 'Bet deleted' };
    } catch (err) {
        console.error(err);
        return { message: 'Failed to delete bet' };
    }
}

module.exports = {
    getAllBets,
    getBetById,
    getBetsByEvent,
    getBetsByUser,
    insertBet,
    updateBet,
    deleteBet
};
