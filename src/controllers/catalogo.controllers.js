const Universidad = require('../models/universidadModel');
const Facultad = require('../models/facultadModel');
const Carrera = require('../models/carreraModel');
const Materia = require('../models/materiaModel');
const Beca = require('../models/becaModel');

// Controladores para Universidad
exports.getAllUniversidades = async (req, res) => {
  try {
    const universidades = await Universidad.getAllUniversidades();
    res.json({ success: true, data: universidades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUniversidad = async (req, res) => {
  try {
    const newUniversidad = await Universidad.createUniversidad(req.body);
    res.status(201).json({ success: true, data: newUniversidad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateUniversidad = async (req, res) => {
  try {
    const universidad = await Universidad.updateUniversidad(req.params.id, req.body);
    if (!universidad) {
      return res.status(404).json({ success: false, message: 'Universidad no encontrada' });
    }
    res.json({ success: true, data: universidad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteUniversidad = async (req, res) => {
  try {
    await Universidad.deleteUniversidad(req.params.id);
    res.json({ success: true, message: 'Universidad eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controladores para Facultad
exports.getAllFacultades = async (req, res) => {
  try {
    const facultades = await Facultad.getAllFacultades();
    res.json({ success: true, data: facultades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFacultadesByUniversidad = async (req, res) => {
  try {
    const facultades = await Facultad.getFacultadesByUniversidad(req.params.universidadId);
    res.json({ success: true, data: facultades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFacultad = async (req, res) => {
  try {
    const newFacultad = await Facultad.createFacultad(req.body);
    res.status(201).json({ success: true, data: newFacultad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFacultad = async (req, res) => {
  try {
    const facultad = await Facultad.updateFacultad(req.params.id, req.body);
    if (!facultad) {
      return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
    }
    res.json({ success: true, data: facultad });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteFacultad = async (req, res) => {
  try {
    await Facultad.deleteFacultad(req.params.id);
    res.json({ success: true, message: 'Facultad eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controladores para Carrera
exports.getAllCarreras = async (req, res) => {
  try {
    const carreras = await Carrera.getAllCarreras();
    res.json({ success: true, data: carreras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCarrerasByFacultad = async (req, res) => {
  try {
    const carreras = await Carrera.getCarrerasByFacultad(req.params.facultadId);
    res.json({ success: true, data: carreras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCarrera = async (req, res) => {
  try {
    const newCarrera = await Carrera.createCarrera(req.body);
    res.status(201).json({ success: true, data: newCarrera });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCarrera = async (req, res) => {
  try {
    const carrera = await Carrera.updateCarrera(req.params.id, req.body);
    if (!carrera) {
      return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
    }
    res.json({ success: true, data: carrera });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCarrera = async (req, res) => {
  try {
    await Carrera.deleteCarrera(req.params.id);
    res.json({ success: true, message: 'Carrera eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controladores para Materia
exports.getAllMaterias = async (req, res) => {
  try {
    const materias = await Materia.getAllMaterias();
    res.json({ success: true, data: materias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMateriasByCarrera = async (req, res) => {
  try {
    const materias = await Materia.getMateriasByCarrera(req.params.carreraId);
    res.json({ success: true, data: materias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMateria = async (req, res) => {
  try {
    const newMateria = await Materia.createMateria(req.body);
    res.status(201).json({ success: true, data: newMateria });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMateria = async (req, res) => {
  try {
    const materia = await Materia.updateMateria(req.params.id, req.body);
    if (!materia) {
      return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    res.json({ success: true, data: materia });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMateria = async (req, res) => {
  try {
    await Materia.deleteMateria(req.params.id);
    res.json({ success: true, message: 'Materia eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controladores para Becas
exports.getAllBecas = async (req, res) => {
  try {
    const becas = await Beca.getAllBecas();
    res.json({ success: true, data: becas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBeca = async (req, res) => {
  try {
    const newBeca = await Beca.createBeca(req.body);
    res.status(201).json({ success: true, data: newBeca });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBeca = async (req, res) => {
  try {
    const beca = await Beca.updateBeca(req.params.id, req.body);
    if (!beca) {
      return res.status(404).json({ success: false, message: 'Beca no encontrada' });
    }
    res.json({ success: true, data: beca });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBeca = async (req, res) => {
  try {
    await Beca.deleteBeca(req.params.id);
    res.json({ success: true, message: 'Beca eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};