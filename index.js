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
const { createTable } = require("./src/models/convocatoriaModel");

app.use("/api/users", userRoutes);
app.use("/api/convocatorias", convocatoriaRoutes);

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
});
