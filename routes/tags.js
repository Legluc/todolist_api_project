const express = require("express");
const router = express.Router();
const { Tag } = require("../models/index.js");
const { Op } = require("sequelize");
const checkLoggin = require("../middlewares/checkLoggin");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 25, tagname } = req.query;
    const where = {};
    if (tagname) where.tagname = { [Op.like]: `%${tagname}%` };

    const pageInt = Math.max(1, parseInt(page) || 1);
    const limitInt = Math.min(100, Math.max(1, parseInt(limit) || 25));

    const { count, rows: tags } = await Tag.findAndCountAll({
      where,
      limit: limitInt,
      offset: (pageInt - 1) * limitInt,
      order: [["tagname", "ASC"]],
    });

    const totalPages = Math.ceil(count / limitInt);
    res.json({
      tags,
      pagination: {
        totalTags: count,
        totalPages,
        currentPage: pageInt,
        tagsPerPage: limitInt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      attributes: ["id", "tagname"],
    });
    if (!tag) {
      return res.status(404).json({ error: "Le tag est introuvable" });
    }
    res.status(200).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post("/", checkLoggin, async (req, res, next) => {
  try {
    const { tagname } = req.body;
    const tag = await Tag.create({ tagname });
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", checkLoggin, async (req, res, next) => {
  try {
    const { tagname } = req.body;
    const updateData = {};
    if (tagname !== undefined) updateData.tagname = tagname;

    const [updatedRows] = await Tag.update(updateData, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Le tag est introuvable" });
    }

    const updatedTag = await Tag.findByPk(req.params.id);
    res.status(200).json(updatedTag);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", checkLoggin, async (req, res, next) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ error: "Le tag est introuvable" });
    }
    await tag.destroy();
    res.status(200).json({ message: "Tag supprimé avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
