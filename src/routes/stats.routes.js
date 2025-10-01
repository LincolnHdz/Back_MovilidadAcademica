const express = require("express");
const { query } = require("../config/database");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas de este router requieren autenticación y rol administrador
router.use(authMiddleware, requireRole(["administrador"]));

// Usuarios por universidad
router.get("/users/by-universidad", async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.nombre AS label, COUNT(us.id) AS value
       FROM universidades u
       LEFT JOIN users us ON us.universidad_id = u.id
       GROUP BY u.id, u.nombre
       ORDER BY u.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por universidad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios por facultad
router.get("/users/by-facultad", async (req, res) => {
  try {
    const result = await query(
      `SELECT f.id, f.nombre AS label, COUNT(us.id) AS value
       FROM facultades f
       LEFT JOIN users us ON us.facultad_id = f.id
       GROUP BY f.id, f.nombre
       ORDER BY f.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por facultad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios por carrera
router.get("/users/by-carrera", async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.nombre AS label, COUNT(us.id) AS value
       FROM carreras c
       LEFT JOIN users us ON us.carrera_id = c.id
       GROUP BY c.id, c.nombre
       ORDER BY c.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por carrera:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;
