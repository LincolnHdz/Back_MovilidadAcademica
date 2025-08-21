const express = require("express");
const { query } = require("../config/database");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta /api/users funcionando ✅");
});


router.get("/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time");
    res.json({
      success: true,
      message: "Conexión a base de datos exitosa",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en consulta de prueba:", error);
    res.status(500).json({
      success: false,
      message: "Error al conectar con la base de datos",
      error: error.message,
    });
  }
});

module.exports = router;
