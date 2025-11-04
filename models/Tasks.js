const sequelize = require("../core/orm.js");
const { DataTypes } = require("sequelize");

const Task = sequelize.define(
  "Task",
  {
    done: DataTypes.BOOLEAN,
    datetime: DataTypes.DATE,
    titre: DataTypes.STRING,
    description: DataTypes.TEXT,
  },
  {
    tableName: "tasks",
  }
);

module.exports = Task;
