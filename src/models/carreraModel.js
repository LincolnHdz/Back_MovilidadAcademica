const { query } = require("../config/database");

const createCarreraTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS carreras (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      facultad_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_carreras_facultad
        FOREIGN KEY (facultad_id)
        REFERENCES facultades (id)
        ON DELETE CASCADE,
      CONSTRAINT carreras_nombre_facultad_unique UNIQUE (nombre, facultad_id)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla carreras creada o ya existe");
  } catch (error) {
    console.error("Error creando tabla carreras:", error);
    throw error;
  }
};

const createCarrera = async (carreraData) => {
  const { nombre, facultad_id } = carreraData;
  try {
    const result = await query(
      "INSERT INTO carreras (nombre, facultad_id) VALUES ($1, $2) RETURNING *",
      [nombre, facultad_id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAllCarreras = async () => {
  try {
    const result = await query(`
      SELECT c.*, f.nombre as facultad_nombre, u.nombre as universidad_nombre 
      FROM carreras c 
      INNER JOIN facultades f ON c.facultad_id = f.id 
      INNER JOIN universidades u ON f.universidad_id = u.id 
      ORDER BY u.nombre, f.nombre, c.nombre
    `);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getCarreraById = async (id) => {
  try {
    const result = await query(`
      SELECT c.*, f.nombre as facultad_nombre, u.nombre as universidad_nombre 
      FROM carreras c 
      INNER JOIN facultades f ON c.facultad_id = f.id 
      INNER JOIN universidades u ON f.universidad_id = u.id 
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getCarrerasByFacultad = async (facultad_id) => {
  try {
    const result = await query(
      "SELECT * FROM carreras WHERE facultad_id = $1 ORDER BY nombre",
      [facultad_id]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const updateCarrera = async (id, carreraData) => {
  const { nombre, facultad_id } = carreraData;
  try {
    const result = await query(
      "UPDATE carreras SET nombre = $1, facultad_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [nombre, facultad_id, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const deleteCarrera = async (id) => {
  try {
    await query("DELETE FROM carreras WHERE id = $1", [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCarreraTable,
  createCarrera,
  getAllCarreras,
  getCarreraById,
  getCarrerasByFacultad,
  updateCarrera,
  deleteCarrera,
};
