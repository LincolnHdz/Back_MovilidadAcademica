const express = require("express");
const router = express.Router();
const {
  createOrUpdateVisitante,
  getMyVisitanteInfo,
  getVisitanteInfo,
  getAllVisitantes,
  getVisitantesPorTipo,
  deleteVisitante
} = require("../controllers/visitantesInfo.controllers");
const { authMiddleware } = require("../middleware/authMiddleware");

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Rutas para usuarios visitantes
router.post("/", createOrUpdateVisitante); // Crear o actualizar información propia
router.get("/my-info", getMyVisitanteInfo); // Obtener información propia

// Rutas para administradores
router.get("/all", getAllVisitantes); // Obtener todos los visitantes
router.get("/tipo/:tipo", getVisitantesPorTipo); // Obtener visitantes por tipo
router.get("/:user_id", getVisitanteInfo); // Obtener información de un visitante específico
router.delete("/:user_id", deleteVisitante); // Eliminar información de visitante

module.exports = router;
