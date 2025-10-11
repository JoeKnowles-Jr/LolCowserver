const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed

const Bet = sequelize.define('Bet', {
    betId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    betType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    betAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    betOdds: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    betPotentialPayout: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    betStatus: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true, // adds createdAt and updatedAt
    tableName: 'bets'
});

module.exports = Bet;