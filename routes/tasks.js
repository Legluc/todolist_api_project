const sequelize = require("../core/orm.js");
const { Op } = require("sequelize");
const { Task } = require("../models/index.js");
const { Tag } = require("../models/index.js");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 25, titre, done, late } = req.query;
    const userId = req.userId;
    const where = {
      userId: userId,
    };
    if (titre) where.titre = { [Op.like]: `%${titre}%` };
    if (done !== undefined) where.done = done === "true";
    if (late === "true") where.datetime = { [Op.lt]: new Date() };
    else if (late === "false") where.datetime = { [Op.gte]: new Date() };

    const pageInt = Math.max(1, parseInt(page) || 1);
    const limitInt = Math.min(100, Math.max(1, parseInt(limit) || 25));

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit: limitInt,
      offset: (pageInt - 1) * limitInt,
      order: [["datetime", "ASC"]],
    });

    const totalPages = Math.ceil(count / limitInt);

    res.json({
      tasks,
      pagination: {
        totalTasks: count,
        totalPages,
        currentPage: pageInt,
        tasksPerPage: limitInt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      attributes: ["id", "titre", "description", "done", "datetime"],
    });
    if (!task) {
      return res.status(404).json({ error: "La tâche est introuvable" });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { titre, description, done = false, datetime, tagId } = req.body;
    const UserId = req.userId;
    const task = await Task.create({
      titre,
      description,
      done,
      datetime,
      UserId,
    });

    if (tagId && tagId.length > 0) {
      const existingTags = await Tag.findAll({
        where: {
          id: { [Op.in]: tagId },
        },
      });

      if (existingTags.length !== tagId.length) {
        return res.status(400).json({ message: "One or more tags not found." });
      }

      await task.addTags(tagId);
    }

    const taskWithTags = await Task.findByPk(task.id, {
      include: [Tag],
    });

    res.status(201).json(taskWithTags);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { titre, description, done, datetime } = req.body;
    const updateData = {};
    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description;
    if (done !== undefined) updateData.done = done;
    if (datetime !== undefined) updateData.datetime = datetime;

    const [updatedRows] = await Task.update(updateData, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "La tâche est introuvable" });
    }
    const updatedTask = await Task.findByPk(req.params.id);
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "La tâche est introuvable" });
    }
    await task.destroy();
    res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
