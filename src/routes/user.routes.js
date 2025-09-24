const express = require("express");
const { query } = require("../config/database");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { getAllUsers, updateUserRole } = require("../models/userModel");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta /api/users funcionando ✅");
});


router.get("/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time");
    res.json({
      success: true,
      message: "Conexión a base de datos exitosa",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en consulta de prueba:", error);
    res.status(500).json({
      success: false,
      message: "Error al conectar con la base de datos",
      error: error.message,
    });
  }
});

// Admin: listar todos los usuarios
router.get("/all", authMiddleware, requireRole(["administrador"]), async (req, res) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(({ password, ...u }) => u);
    res.status(200).json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Admin: actualizar rol de un usuario
router.patch(
  "/:id/rol",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rol } = req.body;
      const validRoles = ["alumno", "becarios", "administrador"];
      if (!validRoles.includes(rol)) {
        return res.status(400).json({ success: false, message: "Rol inválido" });
      }
      const updated = await updateUserRole(id, rol);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      const { password, ...user } = updated;
      res.status(200).json({ success: true, data: user, message: "Rol actualizado" });
    } catch (error) {
      console.error("Error actualizando rol:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

module.exports = router;
