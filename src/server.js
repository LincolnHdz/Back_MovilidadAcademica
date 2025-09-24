// Este es el que se usa en produccion y manda a llamar a app.js
require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/database");


const { createTable } = require("./models/convocatoriaModel");
const { createUserTable } = require("./models/userModel");
const { createUniversidadTable } = require("./models/universidadModel");
const { createCarreraTable } = require("./models/carreraModel");
const { createMateriaTable } = require("./models/materiaModel");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log("Probando conexión a la base de datos...");
    await testConnection();

  /*  console.log("Inicializando tablas...");
    await createTable();
    await createUserTable();
    await createUniversidadTable();
    await createCarreraTable();
    await createMateriaTable();*/

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1); 
  }
};

startServer();
