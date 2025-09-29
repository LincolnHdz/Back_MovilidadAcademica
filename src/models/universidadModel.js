const { query } = require("../config/database");

const createUniversidadTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS universidades (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      pais VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT universidades_nombre_pais_unique UNIQUE (nombre, pais)
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla universidades creada o ya existe");
  } catch (error) {
    console.error("Error creando tabla universidades:", error);
    throw error;
  }
};

const getAllUniversidades = async () => {
  try {
    const result = await query("SELECT * FROM universidades ORDER BY nombre");
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo universidades:", error);
    throw error;
  }
};

const createUniversidad = async (universidadData) => {
  const { nombre, pais } = universidadData;
  try {
    const result = await query(
      "INSERT INTO universidades (nombre, pais) VALUES ($1, $2) RETURNING *",
      [nombre, pais]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creando universidad:", error);
    throw error;
  }
};

const updateUniversidad = async (id, universidadData) => {
  const { nombre, pais } = universidadData;
  try {
    const result = await query(
      "UPDATE universidades SET nombre = $1, pais = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [nombre, pais, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error actualizando universidad:", error);
    throw error;
  }
};

const deleteUniversidad = async (id) => {
  try {
    await query("DELETE FROM universidades WHERE id = $1", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando universidad:", error);
    throw error;
  }
};

module.exports = {
  createUniversidadTable,
  getAllUniversidades,
  createUniversidad,
  updateUniversidad,
  deleteUniversidad
};


