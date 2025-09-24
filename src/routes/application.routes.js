const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { addApplication, getAllApplications, getApplicationById, getApplicationsByUserId, updateApplicationStatus } = require("../controllers/application.controllers.js");
const { authMiddleware } = require("../middleware/authMiddleware");

// Asegurarse de que la carpeta uploads existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Ruta básica de prueba
router.get('/test', (req, res) => {
  res.json({ message: "API de aplicaciones funcionando correctamente" });
});

// Ruta para crear una nueva solicitud con manejo de archivos - requiere autenticación
router.post('/addApplication', authMiddleware, upload.single('archivo'), addApplication);

// Ruta para obtener todas las solicitudes - requiere autenticación
router.get('/all', authMiddleware, getAllApplications);

// Ruta para que el administrador obtenga todas las solicitudes
router.get('/admin/all', authMiddleware, getAllApplications);

// Ruta para obtener las solicitudes del usuario autenticado
router.get('/user/applications', authMiddleware, getApplicationsByUserId);

// Ruta para obtener una solicitud por ID - requiere autenticación
router.get('/:id', authMiddleware, getApplicationById);

// Ruta para actualizar estado y comentarios de una solicitud
router.patch('/:id/status', authMiddleware, updateApplicationStatus);

module.exports = router;
