const sequelize = require("../core/orm.js");
const { DataTypes } = require("sequelize");

const Tag = sequelize.define(
  "Tag",
  {
    tagname: DataTypes.STRING,
  },
  {
    tableName: "tag",
  }
);

module.exports = Tag;
