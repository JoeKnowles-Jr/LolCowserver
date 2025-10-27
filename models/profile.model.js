const Profile = (sequelize, DataTypes) => {
    return sequelize.define('Profile', {
        profileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            trim: true
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
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userBio: {
            type: DataTypes.STRING,
            allowNull: true,
            trim: true
        },
    }, {
        timestamps: true,
        tableName: 'profiles'
    });
}

module.exports = Profile;