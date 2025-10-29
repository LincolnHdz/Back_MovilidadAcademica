const { query } = require("../config/database");

const createApplicationTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        apellidoMaterno VARCHAR(100),
        apellidoPaterno VARCHAR(100),
        clave VARCHAR(50),
        cicloEscolarInicio VARCHAR(50),
        cicloEscolarFinal VARCHAR(50),
        universidad VARCHAR(100),
        paisdestino VARCHAR(100),
        carrera VARCHAR(100),
        materiasInteres JSONB DEFAULT '[]',
        archivo JSONB,
        estado VARCHAR(50) DEFAULT 'pendiente',
        comentarios TEXT,
        userId INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(createTableQuery);
    console.log("Tabla de solicitudes creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla de solicitudes:", error);
    throw error;
  }
};

const createApplication = async (applicationData) => {
  try {
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
      archivo,
      userId,
      comentarios = ''
    } = applicationData;

    const result = await query(
      `INSERT INTO applications 
      (nombre, apellidoMaterno, apellidoPaterno, clave, cicloEscolarInicio, cicloEscolarFinal, universidad, paisdestino, carrera, materiasInteres, archivo, estado, userId, comentarios) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        nombre,
        apellidoMaterno,
        apellidoPaterno,
        clave,
        cicloEscolarInicio,
        cicloEscolarFinal,
        universidad,
        paisDestino,
        carrera,
        materiasInteres ? JSON.stringify(materiasInteres) : "[]",
        archivo ? JSON.stringify(archivo) : "{}",
        "pendiente",
        userId,
        comentarios
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    throw error;
  }
};

const getApplicationById = async (id) => {
  try {
    const result = await query(
      "SELECT * FROM applications WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener la solicitud:", error);
    throw error;
  }
};

const getApplicationsByUserId = async (userId) => {
  try {
    const result = await query(
      "SELECT * FROM applications WHERE clave = (SELECT clave FROM users WHERE id = $1) ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error al obtener las solicitudes del usuario:", error);
    throw error;
  }
};

const getAllApplications = async () => {
  try {
    const result = await query(`
      SELECT * FROM applications
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener todas las solicitudes:", error);
    throw error;
  }
};

const updateApplicationStatus = async (id, estado) => {
  try {
    const result = await query(
      `UPDATE applications 
      SET estado = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *`,
      [estado, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud:", error);
    throw error;
  }
};

const deleteApplication = async (id) => {
  try {
    await query("DELETE FROM applications WHERE id = $1", [id]);
    return true;
  } catch (error) {
    console.error("Error al eliminar la solicitud:", error);
    throw error;
  }
};

module.exports = {
  createApplicationTable,
  createApplication,
  getApplicationById,
  getApplicationsByUserId,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
};