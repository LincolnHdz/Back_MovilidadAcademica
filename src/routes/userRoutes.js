const express = require("express");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta /api/users funcionando ✅");
});

module.exports = router;
