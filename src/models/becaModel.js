const { query } = require("../config/database");

const createBecaTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS becas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      pais VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT becas_nombre_pais_unique UNIQUE (nombre, pais)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla becas creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla becas:", error);
    throw error;
  }
};

const createBeca = async (becaData) => {
  const { nombre, pais } = becaData;
  try {
    const result = await query(
      "INSERT INTO becas (nombre, pais) VALUES ($1, $2) RETURNING *",
      [nombre, pais]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'becas_nombre_pais_unique') {
        throw new Error('Ya existe una beca con este nombre en el mismo país');
      }
    }
    throw error;
  }
};

const getAllBecas = async () => {
  try {
    const result = await query("SELECT * FROM becas ORDER BY nombre");
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getBecaById = async (id) => {
  try {
    const result = await query("SELECT * FROM becas WHERE id = $1", [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateBeca = async (id, becaData) => {
  const { nombre, pais } = becaData;
  try {
    const result = await query(
      "UPDATE becas SET nombre = $1, pais = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [nombre, pais, id]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'becas_nombre_pais_unique') {
        throw new Error('Ya existe una beca con este nombre en el mismo país');
      }
    }
    throw error;
  }
};

const deleteBeca = async (id) => {
  try {
    await query("DELETE FROM becas WHERE id = $1", [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBecaTable,
  createBeca,
  getAllBecas,
  getBecaById,
  updateBeca,
  deleteBeca,
};
