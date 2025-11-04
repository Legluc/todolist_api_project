const fs = require("fs");
const morgan = require("morgan");
const path = require("path");

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const logsDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFileName = `${getTodayDate()}.log`;
const logFilePath = path.join(logsDir, logFileName);

const accessLogStream = fs.createWriteStream(logFilePath, { flags: "a" });

morgan.format("custom", (tokens, req, res) => {
  return [
    tokens["remote-addr"](req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
  ].join(" | ");
});

const logger = morgan("custom", {
  stream: accessLogStream,
  skip: (req, res) => {
    return (
      req.originalUrl === "/favicon.ico" || req.originalUrl === "/healthcheck"
    );
  },
});

module.exports = logger;
