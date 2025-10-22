const User = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true
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
        needsPwUpdate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        profileId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        balance: {
            type: DataTypes.DECIMAL,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'users'
    });
}

module.exports = User;