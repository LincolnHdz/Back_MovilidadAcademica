const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const { testConnection } = require("./src/config/database");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

const userRoutes = require("./src/routes/userRoutes");
const convocatoriaRoutes = require("./src/routes/convocatoriaRoutes");
const authRoutes = require("./src/routes/authRoutes");

const { createTable } = require("./src/models/convocatoriaModel");
const { createUserTable } = require("./src/models/userModel");
const { createUniversidadTable } = require("./src/models/universidadModel");
const { createCarreraTable } = require("./src/models/carreraModel");
const { createMateriaTable } = require("./src/models/materiaModel");

app.use("/api/users", userRoutes);
app.use("/api/convocatorias", convocatoriaRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);

  console.log(" Probando conexión a la base de datos...");
  await testConnection();

  console.log(" Inicializando tablas...");
  await createTable();
  await createUserTable();
  await createUniversidadTable();
  await createCarreraTable();
  await createMateriaTable();
});
