const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const { testConnection } = require("./src/config/database");
const path = require("path");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

const userRoutes = require("./src/routes/user.routes");
const convocatoriaRoutes = require("./src/routes/convocatoria.routes");
const authRoutes = require("./src/routes/auth.routes");
const applicationRoutes = require("./src/routes/application.routes");
const catalogoRoutes = require("./src/routes/catalogo.routes");
const statsRoutes = require("./src/routes/stats.routes");
const visitantesInfoRoutes = require("./src/routes/visitantesInfo.routes");
const {
  router: visitorLogRoutes,
  trackVisit,
} = require("./src/routes/visitorLog.routes");

// Importar todas las funciones de creación de tablas
const { createTable } = require("./src/models/convocatoriaModel");
const { createUserTable } = require("./src/models/userModel");
const { createUniversidadTable } = require("./src/models/universidadModel");
const { createFacultadTable } = require("./src/models/facultadModel");
const { createCarreraTable } = require("./src/models/carreraModel");
const { createMateriaTable } = require("./src/models/materiaModel");
const { createBecaTable } = require("./src/models/becaModel");
const { createApplicationTable } = require("./src/models/applicationModel");
const { createVisitorLogTable } = require("./src/models/visitorLogModel");
const { createVisitantesInfoTable } = require("./src/models/visitantesInfoModel");

app.use("/api/users", userRoutes);
app.use("/api/convocatorias", convocatoriaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/visitantes-info", visitantesInfoRoutes);
app.use("/api/visitor-logs", visitorLogRoutes);

// Ruta para descargar archivos directamente
const fs = require("fs");
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    // Configurar headers para forzar la descarga
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Enviar el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send("Archivo no encontrado");
  }
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);

  console.log(" Probando conexión a la base de datos...");
  await testConnection();

  console.log(" Tablas ya inicializadas previamente.");
  // Comentamos la inicialización de tablas para evitar recrearlas en cada ejecución
  /*
  await createTable();
  await createUniversidadTable(); // Primero las universidades
  await createBecaTable(); // Becas es independiente
  await createFacultadTable(); // Facultades depende de universidades
  await createCarreraTable(); // Carreras depende de facultades
  await createMateriaTable(); // Materias depende de carreras
  await createUserTable(); // Users depende de todas las anteriores
  await createApplicationTable(); // Applications depende de users
  await createVisitorLogTable(); // Visitor logs
  await createVisitantesInfoTable(); // Información adicional de visitantes
  */
});
