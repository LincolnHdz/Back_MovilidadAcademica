const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());



// Importar rutas
const userRoutes = require("./src/routes/userRoutes");
app.use("/api/users", userRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
