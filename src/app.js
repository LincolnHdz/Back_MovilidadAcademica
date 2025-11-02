/// en desarrollo es llamado por index.js y en produccion por server.js

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");


const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors());
// Aumentar el límite de body parser para permitir importación de CSV grandes
// Límite de 10MB para JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para manejar datos de formularios

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Rutas
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/convocatorias", require("./routes/convocatoria.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/filters", require("./routes/filters.routes")); // <-- agregar esta línea
app.use("/api/catalogo", require("./routes/catalogo.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/visitantes-info", require("./routes/visitantesInfo.routes"));

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
