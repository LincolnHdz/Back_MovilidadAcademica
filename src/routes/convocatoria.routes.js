const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getConvocatorias,
  getConvocatoria,
  createNewConvocatoria,
  updateConvocatoriaById,
  deleteConvocatoriaById,
} = require("../controllers/convocatoria.controllers");

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

//  Obtener todas las convocatorias
router.get("/", getConvocatorias);

//  Obtener una convocatoria por ID
router.get("/:id", getConvocatoria);

//  Crear nueva convocatoria (becarios y administrador)
router.post("/", authMiddleware, requireRole(["becarios", "administrador"]), upload.single("imagen"), createNewConvocatoria);

//  Actualizar convocatoria (becarios y administrador)
router.put("/:id", authMiddleware, requireRole(["becarios", "administrador"]), upload.single("imagen"), updateConvocatoriaById);

// Eliminar convocatoria (administrador)
router.delete("/:id", authMiddleware, requireRole(["administrador"]), deleteConvocatoriaById);

module.exports = router;
