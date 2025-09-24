const {
  getAllConvocatorias,
  getConvocatoriaById,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
} = require("../models/convocatoriaModel");

// Obtener todas las convocatorias
const getConvocatorias = async (req, res) => {
  try {
    const convocatorias = await getAllConvocatorias();
    res.status(200).json({
      success: true,
      data: convocatorias,
      message: "Convocatorias obtenidas exitosamente",
    });
  } catch (error) {
    console.error("Error en getConvocatorias:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener una convocatoria por ID
const getConvocatoria = async (req, res) => {
  try {
    const { id } = req.params;
    const convocatoria = await getConvocatoriaById(id);
    
    if (!convocatoria) {
      return res.status(404).json({
        success: false,
        message: "Convocatoria no encontrada",
      });
    }
    
    res.status(200).json({
      success: true,
      data: convocatoria,
      message: "Convocatoria obtenida exitosamente",
    });
  } catch (error) {
    console.error("Error en getConvocatoria:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Crear nueva convocatoria
const createNewConvocatoria = async (req, res) => {
  try {
    const { titulo, descripcion, fecha } = req.body;
    let imagen = null;
    if (req.file) {
      imagen = `/uploads/${req.file.filename}`;
    }
    
    // Validaciones básicas
    if (!titulo || !descripcion || !fecha) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios: titulo, descripcion, fecha",
      });
    }
    
    // Validar formato de fecha
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      });
    }
    
    const nuevaConvocatoria = await createConvocatoria({
      titulo,
      descripcion,
      fecha,
      imagen,
    });
    
    res.status(201).json({
      success: true,
      data: nuevaConvocatoria,
      message: "Convocatoria creada exitosamente",
    });
  } catch (error) {
    console.error("Error en createNewConvocatoria:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar convocatoria
const updateConvocatoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha } = req.body;
    let imagen = req.body.imagen || null;
    if (req.file) {
      imagen = `/uploads/${req.file.filename}`;
    }
    
    // Validaciones básicas
    if (!titulo || !descripcion || !fecha) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios: titulo, descripcion, fecha",
      });
    }
    
    // Validar formato de fecha
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      });
    }
    
    const convocatoriaActualizada = await updateConvocatoria(id, {
      titulo,
      descripcion,
      fecha,
      imagen,
    });
    
    if (!convocatoriaActualizada) {
      return res.status(404).json({
        success: false,
        message: "Convocatoria no encontrada",
      });
    }
    
    res.status(200).json({
      success: true,
      data: convocatoriaActualizada,
      message: "Convocatoria actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en updateConvocatoriaById:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Eliminar convocatoria
const deleteConvocatoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener la convocatoria antes de eliminar para saber la imagen
    const convocatoria = await getConvocatoriaById(id);
    const convocatoriaEliminada = await deleteConvocatoria(id);
    if (!convocatoriaEliminada) {
      return res.status(404).json({
        success: false,
        message: "Convocatoria no encontrada",
      });
    }
    // Eliminar imagen del disco si existe
    if (convocatoria && convocatoria.imagen) {
      const fs = require('fs');
      const imagePath = require('path').join(__dirname, '../../', convocatoria.imagen);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('No se pudo eliminar la imagen:', imagePath);
        }
      });
    }
    res.status(200).json({
      success: true,
      data: convocatoriaEliminada,
      message: "Convocatoria eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteConvocatoriaById:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

module.exports = {
  getConvocatorias,
  getConvocatoria,
  createNewConvocatoria,
  updateConvocatoriaById,
  deleteConvocatoriaById,
};
