const express = require("express");
const router = express.Router();
const { User } = require("../models/index.js");
const { Op } = require("sequelize");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 25, username, mail } = req.query;
    const where = {};
    if (username) where.username = { [Op.like]: `%${username}%` };
    if (mail) where.mail = { [Op.like]: `%${mail}%` };

    const pageInt = Math.max(1, parseInt(page) || 1);
    const limitInt = Math.min(100, Math.max(1, parseInt(limit) || 25));

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: limitInt,
      offset: (pageInt - 1) * limitInt,
      order: [["username", "ASC"]],
      attributes: ["id", "username", "mail"],
    });

    const totalPages = Math.ceil(count / limitInt);
    res.json({
      users,
      pagination: {
        totalUsers: count,
        totalPages,
        currentPage: pageInt,
        usersPerPage: limitInt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "username", "mail"],
    });
    if (!user) {
      return res.status(404).json({ error: "L'utilisateur est introuvable" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// POST /users : Crée un nouvel utilisateur
router.post("/", async (req, res, next) => {
  try {
    const { username, mail, password } = req.body;
    const user = await User.create({ username, mail, password });
    res.status(201).json({
      id: user.id,
      username: user.username,
      mail: user.mail,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { username, mail, password } = req.body;
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (mail !== undefined) updateData.mail = mail;
    if (password !== undefined) updateData.password = password;

    const [updatedRows] = await User.update(updateData, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "L'utilisateur est introuvable" });
    }

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: ["id", "username", "mail"],
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "L'utilisateur est introuvable" });
    }
    await user.destroy();
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
