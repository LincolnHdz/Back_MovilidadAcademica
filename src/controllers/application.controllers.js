const { query } = require("../config/database");

const addApplication = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    console.log("Archivo recibido:", req.file);

    const {
      nombre,
      apellidoMaterno,
      apellidoPaterno,
      clave,
      cicloEscolarInicio,
      cicloEscolarFinal,
      universidad,
      paisDestino,
      carrera,
      materiasInteres,
      comentarios = ''
    } = req.body;
    
    // Parsear las materias de interés si vienen como string JSON
    let parsedMateriasInteres = [];
    if (materiasInteres) {
      try {
        parsedMateriasInteres = typeof materiasInteres === 'string' ? JSON.parse(materiasInteres) : materiasInteres;
        console.log("Materias de interés parseadas:", parsedMateriasInteres);
      } catch (error) {
        console.error("Error al parsear materiasInteres:", error);
      }
    }

    // Información del archivo
    let archivoInfo = {};
    if (req.file) {
      archivoInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    // Crear tabla si no existe
    const createTable = `
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        apellidomaterno VARCHAR(100),
        apellidopaterno VARCHAR(100),
        clave VARCHAR(50),
        cicloescolarinicio VARCHAR(50),
        cicloescolarfinal VARCHAR(50),
        universidad VARCHAR(100),
        paisdestino VARCHAR(100),
        carrera VARCHAR(100),
        materiasinteres JSONB DEFAULT '[]', 
        archivo JSONB,
        estado VARCHAR(50) DEFAULT 'pendiente',
        comentarios TEXT,
        userid INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await query(createTable);

    // Obtener información del usuario autenticado
    const userId = req.user ? req.user.id : null;
    const userClave = req.user ? req.user.clave : null;
    
    // Insertar datos
    const insertData = `
      INSERT INTO applications 
      (nombre, apellidomaterno, apellidopaterno, clave, cicloescolarinicio, cicloescolarfinal, universidad, paisdestino, carrera, materiasinteres, archivo, userid, comentarios) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `;

    const result = await query(insertData, [
      nombre,
      apellidoMaterno,
      apellidoPaterno,
      userClave, // Mantenemos la clave solo como campo informativo
      cicloEscolarInicio,
      cicloEscolarFinal,
      universidad,
      paisDestino,
      carrera,
      JSON.stringify(parsedMateriasInteres),
      JSON.stringify(archivoInfo),
      userId, // Este es ahora el campo principal para la relación
      comentarios
    ]);

    res.json({ 
      success: true,
      message: "Solicitud añadida correctamente", 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("Error en addApplication:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al añadir solicitud",
      error: error.message 
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    // Extraer filtros de query params
    const { 
      facultad_id, 
      carrera_id, 
      universidad_id, 
      beca_id, 
      tipo_movilidad,
      ciclo_escolar_inicio,
      ciclo_escolar_final
    } = req.query;

    // Construir condiciones WHERE dinámicamente
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (facultad_id) {
      paramCount++;
      params.push(facultad_id);
      whereConditions.push(`u.facultad_id = $${paramCount}`);
    }

    if (carrera_id) {
      paramCount++;
      params.push(carrera_id);
      whereConditions.push(`u.carrera_id = $${paramCount}`);
    }

    if (universidad_id) {
      paramCount++;
      params.push(universidad_id);
      whereConditions.push(`u.universidad_id = $${paramCount}`);
    }

    if (beca_id) {
      paramCount++;
      params.push(beca_id);
      whereConditions.push(`u.beca_id = $${paramCount}`);
    }

    if (tipo_movilidad) {
      paramCount++;
      params.push(tipo_movilidad);
      whereConditions.push(`u.tipo_movilidad = $${paramCount}`);
    }

    if (ciclo_escolar_inicio) {
      paramCount++;
      params.push(ciclo_escolar_inicio);
      whereConditions.push(`u.ciclo_escolar_inicio = $${paramCount}`);
    }

    if (ciclo_escolar_final) {
      paramCount++;
      params.push(ciclo_escolar_final);
      whereConditions.push(`u.ciclo_escolar_final = $${paramCount}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // JOIN mejorado para traer datos de catálogos
    const queryText = `
      SELECT a.*, 
        u.nombres, 
        u.apellido_paterno, 
        u.apellido_materno, 
        u.email, 
        u.telefono, 
        u.clave as user_clave, 
        u.rol,
        u.ciclo_escolar_inicio AS user_ciclo_escolar_inicio,
        u.ciclo_escolar_final AS user_ciclo_escolar_final,
        u.facultad_id,
        u.carrera_id,
        u.universidad_id,
        u.beca_id,
        u.tipo_movilidad,
        f.nombre AS facultad_nombre,
        c.nombre AS carrera_nombre,
        uni.nombre AS universidad_nombre,
        b.nombre AS beca_nombre
      FROM applications a
      LEFT JOIN users u ON a.userid = u.id
      LEFT JOIN facultades f ON u.facultad_id = f.id
      LEFT JOIN carreras c ON u.carrera_id = c.id
      LEFT JOIN universidades uni ON u.universidad_id = uni.id
      LEFT JOIN becas b ON u.beca_id = b.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    console.log('Query con filtros:', queryText);
    console.log('Parámetros:', params);

    const result = await query(queryText, params);
    
    res.json({ 
      success: true,
      data: result.rows,
      filters: req.query // Devolver filtros aplicados para referencia
    });
  } catch (error) {
    console.error("Error al obtener todas las solicitudes:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las solicitudes",
      error: error.message 
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    // traer también datos del usuario relacionado (incluye ciclo_escolar)
    const result = await query(`
      SELECT a.*,
             u.nombres, 
             u.apellido_paterno, 
             u.apellido_materno,
             u.email,
             u.telefono,
             u.clave as user_clave,
             u.ciclo_escolar_inicio AS user_ciclo_escolar_inicio,
             u.ciclo_escolar_final AS user_ciclo_escolar_final
      FROM applications a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Solicitud no encontrada" 
      });
    }
    
    res.json({ 
      success: true,
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al obtener la solicitud:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la solicitud",
      error: error.message 
    });
  }
};

// Nueva función para obtener aplicaciones por ID de usuario
const getApplicationsByUserId = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
    }
    
    const result = await query(
      "SELECT * FROM applications WHERE userid = $1 ORDER BY created_at DESC", 
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Error al obtener las solicitudes del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las solicitudes del usuario",
      error: error.message
    });
  }
};

// Actualizar estado y comentarios de una solicitud
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentarios } = req.body;
    if (!['en_revision', 'aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado no válido.' });
    }
    // Actualizar la solicitud
    const updateResult = await query(
      `UPDATE applications SET estado = $1, comentarios = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [estado, comentarios, id]
    );
    
    // Obtener la solicitud actualizada con JOIN para incluir los datos del usuario
    const resultWithUserData = await query(`
      SELECT a.*, 
             u.nombres, 
             u.apellido_paterno, 
             u.apellido_materno,
             u.email,
             u.clave as user_clave,
             u.ciclo_escolar_inicio AS user_ciclo_escolar_inicio,
             u.ciclo_escolar_final AS user_ciclo_escolar_final
      FROM applications a
      LEFT JOIN users u ON a.userid = u.id
      WHERE a.id = $1
    `, [id]);
    
    if (resultWithUserData.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }
    
    res.json({ success: true, data: resultWithUserData.rows[0] });
  } catch (error) {
    console.error('Error al actualizar estado de solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado de solicitud', error: error.message });
  }
};

module.exports = { 
  addApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUserId,
  updateApplicationStatus,
};