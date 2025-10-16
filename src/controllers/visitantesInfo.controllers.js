const {
  createOrUpdateVisitanteInfo,
  getVisitanteInfoByUserId,
  getAllVisitantesInfo,
  deleteVisitanteInfo,
  getVisitantesByTipo
} = require("../models/visitantesInfoModel");

// Crear o actualizar información de visitante
const createOrUpdateVisitante = async (req, res) => {
  try {
    const user_id = req.user.id; // Obtenido del middleware de autenticación
    
    const {
      pais_origen,
      fecha_nacimiento,
      preparatoria,
      entidad_federativa,
      nombre_tutor,
      dni_curp,
      sexo
    } = req.body;

    // Validar que el usuario sea visitante nacional o internacional
    if (!['visitante_nacional', 'visitante_internacional'].includes(req.user.tipo_movilidad)) {
      return res.status(403).json({
        success: false,
        message: "Solo los visitantes nacionales e internacionales pueden actualizar esta información"
      });
    }

    const visitanteData = {
      user_id,
      pais_origen,
      fecha_nacimiento,
      preparatoria,
      entidad_federativa,
      nombre_tutor,
      dni_curp,
      sexo
    };

    const result = await createOrUpdateVisitanteInfo(visitanteData);

    res.status(200).json({
      success: true,
      message: "Información de visitante actualizada correctamente",
      data: result
    });

  } catch (error) {
    console.error("Error en createOrUpdateVisitante:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener información de visitante del usuario actual
const getMyVisitanteInfo = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Validar que el usuario sea visitante nacional o internacional
    if (!['visitante_nacional', 'visitante_internacional'].includes(req.user.tipo_movilidad)) {
      return res.status(403).json({
        success: false,
        message: "Solo los visitantes nacionales e internacionales tienen acceso a esta información"
      });
    }

    const visitanteInfo = await getVisitanteInfoByUserId(user_id);

    res.status(200).json({
      success: true,
      data: visitanteInfo
    });

  } catch (error) {
    console.error("Error en getMyVisitanteInfo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener información de un visitante específico (solo admin)
const getVisitanteInfo = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Solo los administradores pueden ver información de otros usuarios
    if (req.user.tipo_movilidad !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a esta información"
      });
    }

    const visitanteInfo = await getVisitanteInfoByUserId(user_id);

    if (!visitanteInfo) {
      return res.status(404).json({
        success: false,
        message: "Información de visitante no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      data: visitanteInfo
    });

  } catch (error) {
    console.error("Error en getVisitanteInfo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener todas las informaciones de visitantes (solo admin)
const getAllVisitantes = async (req, res) => {
  try {
    // Solo los administradores pueden ver toda la información
    if (req.user.tipo_movilidad !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a esta información"
      });
    }

    const visitantes = await getAllVisitantesInfo();

    res.status(200).json({
      success: true,
      data: visitantes
    });

  } catch (error) {
    console.error("Error en getAllVisitantes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener visitantes por tipo de movilidad (solo admin)
const getVisitantesPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Solo los administradores pueden ver esta información
    if (req.user.tipo_movilidad !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a esta información"
      });
    }

    // Validar tipo de movilidad
    if (!['visitante_nacional', 'visitante_internacional'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de movilidad no válido"
      });
    }

    const visitantes = await getVisitantesByTipo(tipo);

    res.status(200).json({
      success: true,
      data: visitantes
    });

  } catch (error) {
    console.error("Error en getVisitantesPorTipo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Eliminar información de visitante (solo admin o el propio usuario)
const deleteVisitante = async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user.id;

    // Solo el propio usuario o admin pueden eliminar la información
    if (req.user.tipo_movilidad !== 'admin' && currentUserId !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar esta información"
      });
    }

    const deletedVisitante = await deleteVisitanteInfo(user_id);

    if (!deletedVisitante) {
      return res.status(404).json({
        success: false,
        message: "Información de visitante no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Información de visitante eliminada correctamente",
      data: deletedVisitante
    });

  } catch (error) {
    console.error("Error en deleteVisitante:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateVisitante,
  getMyVisitanteInfo,
  getVisitanteInfo,
  getAllVisitantes,
  getVisitantesPorTipo,
  deleteVisitante
};