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
      claveMateria,
      cicloEscolar,
      universidad,
      carrera,
      materia,
      comentarios = ''
    } = req.body;

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
        apellidoMaterno VARCHAR(100),
        apellidoPaterno VARCHAR(100),
        clave VARCHAR(50),
        claveMateria VARCHAR(50),
        cicloEscolar VARCHAR(50),
        universidad VARCHAR(100),
        carrera VARCHAR(100),
        materia VARCHAR(100),
        archivo JSONB,
        estado VARCHAR(50) DEFAULT 'pendiente',
        comentarios TEXT,
        userId INTEGER REFERENCES users(id),
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
      (nombre, apellidoMaterno, apellidoPaterno, clave, claveMateria, cicloEscolar, universidad, carrera, materia, archivo, userId, comentarios) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;

    const result = await query(insertData, [
      nombre,
      apellidoMaterno,
      apellidoPaterno,
      userClave, // Mantenemos la clave solo como campo informativo
      claveMateria,
      cicloEscolar,
      universidad,
      carrera,
      materia,
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
    // JOIN para traer datos relevantes del usuario junto con la solicitud
    const result = await query(`
      SELECT a.*, 
        u.nombres, u.apellido_paterno, u.apellido_materno, u.email, u.telefono, u.clave as user_clave, u.rol
      FROM applications a
      LEFT JOIN users u ON a.userid = u.id
      ORDER BY a.created_at DESC
    `);
    res.json({ 
      success: true,
      data: result.rows 
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
    const result = await query("SELECT * FROM applications WHERE id = $1", [id]);
    
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
      "SELECT * FROM applications WHERE userId = $1 ORDER BY created_at DESC", 
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
    await query(
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
             u.clave as user_clave
      FROM applications a
      LEFT JOIN users u ON a.userId = u.id
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