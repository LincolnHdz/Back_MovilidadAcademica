const { query } = require("../config/database");

const createVisitantesInfoTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS visitantes_info (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      pais_origen VARCHAR(100),
      fecha_nacimiento DATE,
      preparatoria VARCHAR(255),
      entidad_federativa VARCHAR(100),
      nombre_tutor VARCHAR(255),
      dni_curp VARCHAR(50),
      sexo VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla visitantes_info creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla visitantes_info:", error);
    throw error;
  }
};

// Crear o actualizar información de visitante
const createOrUpdateVisitanteInfo = async (visitanteData) => {
  const {
    user_id,
    pais_origen,
    fecha_nacimiento,
    preparatoria,
    entidad_federativa,
    nombre_tutor,
    dni_curp,
    sexo
  } = visitanteData;

  try {
    // Verificar si ya existe información para este usuario
    const existingInfo = await query(
      'SELECT * FROM visitantes_info WHERE user_id = $1',
      [user_id]
    );

    if (existingInfo.rows.length > 0) {
      // Actualizar información existente
      const result = await query(
        `UPDATE visitantes_info 
         SET pais_origen = $2, fecha_nacimiento = $3, preparatoria = $4, 
             entidad_federativa = $5, nombre_tutor = $6, dni_curp = $7, 
             sexo = $8, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 
         RETURNING *`,
        [user_id, pais_origen, fecha_nacimiento, preparatoria, entidad_federativa, nombre_tutor, dni_curp, sexo]
      );
      return result.rows[0];
    } else {
      // Crear nueva información
      const result = await query(
        `INSERT INTO visitantes_info 
         (user_id, pais_origen, fecha_nacimiento, preparatoria, entidad_federativa, nombre_tutor, dni_curp, sexo) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [user_id, pais_origen, fecha_nacimiento, preparatoria, entidad_federativa, nombre_tutor, dni_curp, sexo]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error("Error al crear/actualizar información de visitante:", error);
    throw error;
  }
};

// Obtener información de visitante por user_id
const getVisitanteInfoByUserId = async (user_id) => {
  try {
    const result = await query(
      `SELECT vi.*, u.nombres, u.apellido_paterno, u.apellido_materno, u.tipo_movilidad
       FROM visitantes_info vi
       JOIN users u ON vi.user_id = u.id
       WHERE vi.user_id = $1`,
      [user_id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener información de visitante:", error);
    throw error;
  }
};

// Obtener todas las informaciones de visitantes
const getAllVisitantesInfo = async () => {
  try {
    const result = await query(
      `SELECT vi.*, u.nombres, u.apellido_paterno, u.apellido_materno, u.tipo_movilidad, u.email
       FROM visitantes_info vi
       JOIN users u ON vi.user_id = u.id
       ORDER BY vi.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error("Error al obtener todas las informaciones de visitantes:", error);
    throw error;
  }
};

// Eliminar información de visitante
const deleteVisitanteInfo = async (user_id) => {
  try {
    const result = await query(
      'DELETE FROM visitantes_info WHERE user_id = $1 RETURNING *',
      [user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al eliminar información de visitante:", error);
    throw error;
  }
};

// Obtener visitantes por tipo de movilidad
const getVisitantesByTipo = async (tipo_movilidad) => {
  try {
    const result = await query(
      `SELECT vi.*, u.nombres, u.apellido_paterno, u.apellido_materno, u.tipo_movilidad, u.email
       FROM visitantes_info vi
       JOIN users u ON vi.user_id = u.id
       WHERE u.tipo_movilidad = $1
       ORDER BY vi.created_at DESC`,
      [tipo_movilidad]
    );
    return result.rows;
  } catch (error) {
    console.error("Error al obtener visitantes por tipo:", error);
    throw error;
  }
};

module.exports = {
  createVisitantesInfoTable,
  createOrUpdateVisitanteInfo,
  getVisitanteInfoByUserId,
  getAllVisitantesInfo,
  deleteVisitanteInfo,
  getVisitantesByTipo
};
