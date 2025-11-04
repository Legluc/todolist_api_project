var express = require("express");
var router = express.Router();

const mysql = require("../core/sql");

//IMPORTANT A FAIRE

// AJOUTER le GetById POST PATCH DELETE

// 5) Table User + foreign Key dans task
// 6) Préparer une route login/register
// 7) remplacer mysql2 par sequelize

/* GET tasks page. */
router.get("/", async function (req, res, next) {
  try {
    const connection = await mysql.getConnection();
    let { page = 1, limit = 10, titre, done, late } = req.query;

    let query = "SELECT * FROM tasks WHERE 1=1";
    let params = [];

    if (titre) {
      query += " AND titre LIKE ?";
      params.push(`%${titre}%`);
    }
    if (done !== undefined) {
      query += " AND done = ?";
      params.push(done === "true");
    }
    if (late === "true") {
      query += " AND datetime < NOW()";
    } else if (late === "false") {
      query += " AND datetime >= NOW()";
    }

    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [results] = await connection.query(query, params);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

/* GET task id page. */
router.get("/:id", async function (req, res, next) {
  try {
    const connection = await mysql.getConnection();

    const [results] = await connection.query(
      "SELECT ?? FROM tasks where id = ?",
      [["id", "titre", "description"], req.params.id]
    );

    if (results.length === 0) {
      res.status(404);
      res.json({ error: "la task est introuvable" });
    }
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

/* POST tasks page. */
router.post("/", async function (req, res, next) {
  try {
    const { titre, description, done = false, datetime } = req.body;
    const connection = await mysql.getConnection();

    const [result] = await connection.query(
      "INSERT INTO tasks (titre, description, done, datetime) VALUES (?, ?, ?, ?)",
      [titre, description, done, datetime]
    );

    const [task] = await connection.query("SELECT * FROM tasks WHERE id = ?", [
      result.insertId,
    ]);

    if (task === 0) {
      res.status(404).json({ error: "la task est introuvable" });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/* PATCH tasks page. */
router.patch("/:id", async function (req, res, next) {
  try {
    const { titre, description, done = false, datetime } = req.body;
    const connection = await mysql.getConnection();
    const task = [titre, description, done, datetime, req.params.id];

    const [results] = await connection.query(
      "UPDATE tasks SET titre = ?, description = ?, done = ?, datetime = ? WHERE id = ?",
      task
    );
    if (results.affectedRows === 0) {
      res.status(404);
      res.json({ error: "la task est introuvable" });
    }

    const [updatedTask] = await connection.query(
      "SELECT * FROM tasks WHERE id = ?",
      [req.params.id]
    );

    res.status(200).json(updatedTask[0]);
  } catch (err) {
    next(err);
  }
});

/* DELETE tasks page. */
router.delete("/:id", async function (req, res, next) {
  try {
    const connection = await mysql.getConnection();

    const [task] = await connection.query("SELECT id FROM tasks WHERE id = ?", [
      req.params.id,
    ]);

    if (task.length === 0) {
      return res.status(404).json({ error: "la task est introuvable" });
    }

    await connection.query("DELETE FROM tasks WHERE id= ?", [req.params.id]);

    res.status(200).json({ message: "Task supprimée avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
