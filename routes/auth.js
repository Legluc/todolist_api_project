const express = require("express");
const router = express.Router();
const validator = require("validator");
const { User } = require("../models/index.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function isValidEmail(email) {
  return validator.isEmail(email);
}

router.post("/register", async (req, res, next) => {
  try {
    const { username, mail, password, confPass } = req.body;
    if (confPass != password || String(password).length < 8) {
      res.status(403).json({ error: "le mdp n'est pas valide." });
    } else if (!isValidEmail(mail)) {
      res.status(403).json({ error: "L'adresse e-mail n'est pas valide." });
    } else {
      const passCrypted = await bcrypt.hash(String(password), 12);
      const user = await User.create({ username, mail, password: passCrypted });
      res.status(201).json({
        id: user.id,
        username: user.username,
        mail: user.mail,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ where: { mail } });
    if (!user) {
      res
        .status(403)
        .json({ error: "L'e-mail ou le mot de passe n'est pas valide." });
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      res
        .status(403)
        .json({ error: "L'e-mail ou le mot de passe n'est pas valide." });
    }
    const jwtToken = jwt.sign({ userId: user.id }, process.env.KEY_TOKEN, {
      expiresIn: "1h",
    });
    res.status(201).json({ token: jwtToken });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-token", async (req, res, next) => {
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
});
module.exports = router;
