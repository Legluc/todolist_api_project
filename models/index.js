const sequelize = require("../core/orm.js");
const Task = require("./Tasks.js");
const User = require("./User.js");
const Tag = require("./Tag.js");

Task.belongsTo(User);
User.hasMany(Task);
Tag.belongsToMany(Task, { through: "TaskTag" });
Task.belongsToMany(Tag, { through: "TaskTag" });

//sequelize.sync({ alter: true });

module.exports = {
  Task,
  User,
  Tag,
  sequelize,
};
