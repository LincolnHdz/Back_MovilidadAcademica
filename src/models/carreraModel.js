const { query } = require("../config/database");

const createCarreraTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS carreras (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      universidad_id INTEGER NOT NULL,
      pais VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_carreras_universidad
        FOREIGN KEY (universidad_id)
        REFERENCES universidades (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      CONSTRAINT carreras_nombre_universidad_unique UNIQUE (nombre, universidad_id)
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



module.exports = {
  createCarreraTable
};
