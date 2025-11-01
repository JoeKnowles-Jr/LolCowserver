const Event = (sequelize, DataTypes) => {
    return sequelize.define('Event', {
        eventId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eventTopic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eventDescription: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eventStatus: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
        {
            tableName: 'events',
            timestamps: true
        });
};

module.exports = Event;