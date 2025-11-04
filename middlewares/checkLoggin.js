const jwt = require("jsonwebtoken");

function checkLoggin(req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }

  const token = bearer.split(" ")[1];

  jwt.verify(token, process.env.KEY_TOKEN, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "Token invalide ou expiré." });
    }
    req.userId = payload.userId;
    req.user = payload;
    next();
  });
}
module.exports = checkLoggin;
