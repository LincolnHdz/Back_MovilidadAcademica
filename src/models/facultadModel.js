const { query } = require("../config/database");

const createFacultadTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS facultades (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        universidad_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (universidad_id) REFERENCES universidades(id) ON DELETE CASCADE,
        CONSTRAINT facultades_nombre_universidad_unique UNIQUE (nombre, universidad_id)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla facultades creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla facultades:", error);
    throw error;
  }
};

const createFacultad = async (facultadData) => {
  const { nombre, universidad_id } = facultadData;
  try {
    const newFacultad = await query(
      "INSERT INTO facultades (nombre, universidad_id) VALUES ($1, $2) RETURNING *",
      [nombre, universidad_id]
    );
    return newFacultad.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAllFacultades = async () => {
  try {
    const result = await query(`
      SELECT f.*, u.nombre as universidad_nombre 
      FROM facultades f 
      INNER JOIN universidades u ON f.universidad_id = u.id 
      ORDER BY u.nombre, f.nombre
    `);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getFacultadById = async (id) => {
  try {
    const result = await query(`
      SELECT f.*, u.nombre as universidad_nombre 
      FROM facultades f 
      INNER JOIN universidades u ON f.universidad_id = u.id 
      WHERE f.id = $1
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getFacultadesByUniversidad = async (universidad_id) => {
  try {
    const result = await query(
      "SELECT * FROM facultades WHERE universidad_id = $1 ORDER BY nombre",
      [universidad_id]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const updateFacultad = async (id, facultadData) => {
  const { nombre, universidad_id } = facultadData;
  try {
    const result = await query(
      "UPDATE facultades SET nombre = $1, universidad_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [nombre, universidad_id, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const deleteFacultad = async (id) => {
  try {
    await query("DELETE FROM facultades WHERE id = $1", [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createFacultadTable,
  createFacultad,
  getAllFacultades,
  getFacultadById,
  getFacultadesByUniversidad,
  updateFacultad,
  deleteFacultad,
};