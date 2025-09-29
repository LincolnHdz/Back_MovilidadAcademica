/// en desarrollo es llamado por index.js y en produccion por server.js

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");


const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para manejar datos de formularios

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Rutas
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/convocatorias", require("./routes/convocatoria.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/filters", require("./routes/filters.routes"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

module.exports = app;
