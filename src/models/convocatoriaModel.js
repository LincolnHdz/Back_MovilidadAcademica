const { query } = require("../config/database");


const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS convocatorias (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT NOT NULL,
      fecha DATE NOT NULL,
      imagen VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla convocatorias creada o ya existe");
  } catch (error) {
    console.error("Error creando tabla convocatorias:", error);
    throw error;
  }
};


const getAllConvocatorias = async () => {
  try {
    const result = await query(
      "SELECT * FROM convocatorias ORDER BY fecha DESC"
    );
    return result.rows;
  } catch (error) {
    console.error("Error obteniendo convocatorias:", error);
    throw error;
  }
};


const getConvocatoriaById = async (id) => {
  try {
    const result = await query("SELECT * FROM convocatorias WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error obteniendo convocatoria por ID:", error);
    throw error;
  }
};


const createConvocatoria = async (convocatoriaData) => {
  const { titulo, descripcion, fecha, imagen } = convocatoriaData;
  try {
    const result = await query(
      "INSERT INTO convocatorias (titulo, descripcion, fecha, imagen) VALUES ($1, $2, $3, $4) RETURNING *",
      [titulo, descripcion, fecha, imagen]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creando convocatoria:", error);
    throw error;
  }
};


const updateConvocatoria = async (id, convocatoriaData) => {
  const { titulo, descripcion, fecha, imagen } = convocatoriaData;
  try {
    const result = await query(
      "UPDATE convocatorias SET titulo = $1, descripcion = $2, fecha = $3, imagen = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [titulo, descripcion, fecha, imagen, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error actualizando convocatoria:", error);
    throw error;
  }
};


const deleteConvocatoria = async (id) => {
  try {
    const result = await query(
      "DELETE FROM convocatorias WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error eliminando convocatoria:", error);
    throw error;
  }
};

module.exports = {
  createTable,
  getAllConvocatorias,
  getConvocatoriaById,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
};
