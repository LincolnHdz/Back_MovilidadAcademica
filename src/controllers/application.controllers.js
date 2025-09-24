const { query } = require("../config/database");

const addApplication = async (req, res) => {
  try {
    console.log("Hola desde application.controllers.js");
    console.log("Datos recibidos:", req.body);

    const {
      nombre,
      apellidoMaterno,
      apellidoPaterno,
      clave,
      claveMateria,
      cicloEscolar,
      universidad,
      carrera,
      materia,
      archivo
    } = req.body;

    // Crear tabla si no existe
    const createTable = `
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        apellidoMaterno VARCHAR(100),
        apellidoPaterno VARCHAR(100),
        clave VARCHAR(50),
        claveMateria VARCHAR(50),
        cicloEscolar VARCHAR(50),
        universidad VARCHAR(100),
        carrera VARCHAR(100),
        materia VARCHAR(100),
        archivo JSONB
      )
    `;
    await query(createTable);

    // Insertar datos
    const insertData = `
      INSERT INTO applications 
      (nombre, apellidoMaterno, apellidoPaterno, clave, claveMateria, cicloEscolar, universidad, carrera, materia, archivo) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const result = await query(insertData, [
      nombre,
      apellidoMaterno,
      apellidoPaterno,
      clave,
      claveMateria,
      cicloEscolar,
      universidad,
      carrera,
      materia,
      archivo ? JSON.stringify(archivo) : "{}"
    ]);

    res.json({ message: "Convocatoria añadida correctamente", data: result.rows[0] });
  } catch (error) {
    console.error("Error en addApplication:", error);
    res.status(500).json({ error: "Error al añadir convocatoria" });
  }
};

module.exports = { addApplication };
