const { query } = require("../config/database");

const createUniversidadTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS universidades (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      direccion VARCHAR(255),
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

module.exports = {
  createUniversidadTable,
};


