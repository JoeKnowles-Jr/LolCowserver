const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // adjust path as needed

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue('email', value.trim().toLowerCase());
        }
    },
    pwHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatarUrl: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}, {
    timestamps: true // adds createdAt and updatedAt
});

module.exports = User;