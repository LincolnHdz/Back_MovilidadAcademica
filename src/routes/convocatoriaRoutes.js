const express = require("express");
const router = express.Router();
const {
  getConvocatorias,
  getConvocatoria,
  createNewConvocatoria,
  updateConvocatoriaById,
  deleteConvocatoriaById,
} = require("../controllers/convocatoriaController");

//  Obtener todas las convocatorias
router.get("/", getConvocatorias);

//  Obtener una convocatoria por ID
router.get("/:id", getConvocatoria);

//  Crear nueva convocatoria
router.post("/", createNewConvocatoria);

//  Actualizar convocatoria
router.put("/:id", updateConvocatoriaById);

// Eliminar convocatoria
router.delete("/:id", deleteConvocatoriaById);

module.exports = router;
