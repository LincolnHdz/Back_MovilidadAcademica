const { query } = require("../config/database");

const createMateriaTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS materias (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      clave VARCHAR(20) NOT NULL,
      creditos INTEGER NOT NULL,
      carrera_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_materias_carrera
        FOREIGN KEY (carrera_id)
        REFERENCES carreras (id)
        ON DELETE CASCADE,
      CONSTRAINT materias_clave_carrera_unique UNIQUE (clave, carrera_id)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla materias creada o ya existe");
  } catch (error) {
    console.error("Error creando tabla materias:", error);
    throw error;
  }
};

const createMateria = async (materiaData) => {
  const { nombre, clave, creditos, carrera_id } = materiaData;
  try {
    const result = await query(
      "INSERT INTO materias (nombre, clave, creditos, carrera_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, clave, creditos, carrera_id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAllMaterias = async () => {
  try {
    const result = await query(`
      SELECT m.*, 
             c.nombre as carrera_nombre,
             c.id as carrera_id,
             f.nombre as facultad_nombre,
             f.id as facultad_id,
             u.nombre as universidad_nombre,
             u.id as universidad_id
      FROM materias m 
      INNER JOIN carreras c ON m.carrera_id = c.id
      INNER JOIN facultades f ON c.facultad_id = f.id
      INNER JOIN universidades u ON f.universidad_id = u.id
      ORDER BY u.nombre, f.nombre, c.nombre, m.nombre
    `);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getMateriaById = async (id) => {
  try {
    const result = await query(`
      SELECT m.*, 
             c.nombre as carrera_nombre,
             c.id as carrera_id,
             f.nombre as facultad_nombre,
             f.id as facultad_id,
             u.nombre as universidad_nombre,
             u.id as universidad_id
      FROM materias m 
      INNER JOIN carreras c ON m.carrera_id = c.id
      INNER JOIN facultades f ON c.facultad_id = f.id
      INNER JOIN universidades u ON f.universidad_id = u.id
      WHERE m.id = $1
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getMateriasByCarrera = async (carrera_id) => {
  try {
    const result = await query(
      "SELECT * FROM materias WHERE carrera_id = $1 ORDER BY nombre",
      [carrera_id]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const updateMateria = async (id, materiaData) => {
  const { nombre, clave, creditos, carrera_id } = materiaData;
  try {
    const result = await query(
      "UPDATE materias SET nombre = $1, clave = $2, creditos = $3, carrera_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [nombre, clave, creditos, carrera_id, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const deleteMateria = async (id) => {
  try {
    await query("DELETE FROM materias WHERE id = $1", [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createMateriaTable,
  createMateria,
  getAllMaterias,
  getMateriaById,
  getMateriasByCarrera,
  updateMateria,
  deleteMateria,
};


