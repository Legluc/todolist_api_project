const sequelize = require("../core/orm.js");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    username: DataTypes.STRING,
    mail: DataTypes.STRING,
    password: DataTypes.STRING,
  },
  {
    tableName: "user",
  }
);

module.exports = User;
