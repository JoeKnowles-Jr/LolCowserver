const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    "cowsino_data",
    "cowsino_data_admin",
    "!@#123Cannabis123!@#",
  {
      host: "vda8100.is.cc",
    dialect: 'mysql',
    logging: false
  }
);

const User = require('./user.model')(sequelize, DataTypes);
const Profile = require('./profile.model')(sequelize, DataTypes);

module.exports = { sequelize, User, Profile };
