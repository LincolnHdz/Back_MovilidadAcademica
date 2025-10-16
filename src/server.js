// Este es el que se usa en produccion y manda a llamar a app.js
require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/database");


const { createTable } = require("./models/convocatoriaModel");
const { createUserTable } = require("./models/userModel");
const { createUniversidadTable } = require("./models/universidadModel");
const { createCarreraTable } = require("./models/carreraModel");
const { createMateriaTable } = require("./models/materiaModel");
const { createApplicationTable } = require("./models/applicationModel");
const { createBecaTable } = require("./models/becaModel");
const { createFacultadTable } = require("./models/facultadModel");
const { createVisitantesInfoTable } = require("./models/visitantesInfoModel");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log("Probando conexión a la base de datos...");
    await testConnection();

    console.log("Tablas ya inicializadas previamente.");
    // Comentamos la inicialización de tablas para evitar recrearlas en cada ejecución
    /*
    await createTable(); // Convocatorias
    await createUniversidadTable(); // Crear universidades primero
    await createFacultadTable(); // Facultades depende de universidades
    await createCarreraTable(); // Carreras
    await createMateriaTable(); // Materias
    await createBecaTable(); // Becas
    await createUserTable(); // Users depende de varias tablas anteriores
    await createApplicationTable(); // Applications depende de users
    await createVisitantesInfoTable(); // Información adicional de visitantes
    */

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1); 
  }
};

startServer();
