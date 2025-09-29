const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogo.controllers');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'administrador') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
};

// Rutas para Universidades
router.get('/universidades', catalogoController.getAllUniversidades);
router.post('/universidades', authMiddleware, isAdmin, catalogoController.createUniversidad);
router.put('/universidades/:id', authMiddleware, isAdmin, catalogoController.updateUniversidad);
router.delete('/universidades/:id', authMiddleware, isAdmin, catalogoController.deleteUniversidad);

// Rutas para Facultades
router.get('/facultades', catalogoController.getAllFacultades);
router.get('/universidades/:universidadId/facultades', catalogoController.getFacultadesByUniversidad);
router.post('/facultades', authMiddleware, isAdmin, catalogoController.createFacultad);
router.put('/facultades/:id', authMiddleware, isAdmin, catalogoController.updateFacultad);
router.delete('/facultades/:id', authMiddleware, isAdmin, catalogoController.deleteFacultad);

// Rutas para Carreras
router.get('/carreras', catalogoController.getAllCarreras);
router.get('/facultades/:facultadId/carreras', catalogoController.getCarrerasByFacultad);
router.post('/carreras', authMiddleware, isAdmin, catalogoController.createCarrera);
router.put('/carreras/:id', authMiddleware, isAdmin, catalogoController.updateCarrera);
router.delete('/carreras/:id', authMiddleware, isAdmin, catalogoController.deleteCarrera);

// Rutas para Materias
router.get('/materias', catalogoController.getAllMaterias);
router.get('/carreras/:carreraId/materias', catalogoController.getMateriasByCarrera);
router.post('/materias', authMiddleware, isAdmin, catalogoController.createMateria);
router.put('/materias/:id', authMiddleware, isAdmin, catalogoController.updateMateria);
router.delete('/materias/:id', authMiddleware, isAdmin, catalogoController.deleteMateria);

// Rutas para Becas
router.get('/becas', catalogoController.getAllBecas);
router.post('/becas', authMiddleware, isAdmin, catalogoController.createBeca);
router.put('/becas/:id', authMiddleware, isAdmin, catalogoController.updateBeca);
router.delete('/becas/:id', authMiddleware, isAdmin, catalogoController.deleteBeca);

module.exports = router;