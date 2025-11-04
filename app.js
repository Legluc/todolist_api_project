const express = require("express");
const path = require("path");
const logger = require("morgan");
const mysql2 = require("mysql2/promise");
require("./models/");
const tasksRouter = require("./routes/tasks");
const tagsRouter = require("./routes/tags");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const loggers = require("./middlewares/loggers");
const checkLoggin = require("./middlewares/checkLoggin");
require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(loggers);
app.use("/auth", authRouter);
app.use("/tags", tagsRouter);
app.use("/users", usersRouter);
app.use("/tasks", checkLoggin, tasksRouter);
app.use("/", indexRouter);

module.exports = app;
