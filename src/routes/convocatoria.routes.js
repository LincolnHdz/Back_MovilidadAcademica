const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getConvocatorias,
  getConvocatoria,
  createNewConvocatoria,
  updateConvocatoriaById,
  deleteConvocatoriaById,
} = require("../controllers/convocatoria.controllers");

//  Obtener todas las convocatorias
router.get("/", getConvocatorias);

//  Obtener una convocatoria por ID
router.get("/:id", getConvocatoria);

//  Crear nueva convocatoria (becarios y administrador)
router.post("/", authMiddleware, requireRole(["becarios", "administrador"]), createNewConvocatoria);

//  Actualizar convocatoria (becarios y administrador)
router.put("/:id", authMiddleware, requireRole(["becarios", "administrador"]), updateConvocatoriaById);

// Eliminar convocatoria (administrador)
router.delete("/:id", authMiddleware, requireRole(["administrador"]), deleteConvocatoriaById);

module.exports = router;
