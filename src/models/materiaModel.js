const { query } = require("../config/database");

const createMateriaTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS materias (
      id SERIAL PRIMARY KEY,
      carrera_id INTEGER NOT NULL,
      nombre VARCHAR(255) NOT NULL,
      maestro VARCHAR(255),
      clave VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_materias_carrera
        FOREIGN KEY (carrera_id)
        REFERENCES carreras (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      CONSTRAINT materias_nombre_carrera_unique UNIQUE (nombre, carrera_id)
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

module.exports = {
  createMateriaTable,
};


