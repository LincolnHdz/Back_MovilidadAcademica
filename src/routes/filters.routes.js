const express = require("express");
const { query } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// Universidades
router.get("/universidades", async (req, res) => {
  try {
    const universidades = await getUniversidades();
    res.json(universidades);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener universidades" });
  }
});

// Facultades
router.get("/facultades", async (req, res) => {
  try {
    const facultades = await getFacultades();
    res.json(facultades);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener facultades" });
  }
});

// Carreras
router.get("/carreras", async (req, res) => {
  try {
    const carreras = await getCarreras();
    res.json(carreras);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener carreras" });
  }
});

// Becas
router.get("/becas", async (req, res) => {
  try {
    const becas = await getBecas();
    res.json(becas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener becas" });
  }
});

// Obtener tipos de movilidad únicos desde users
router.get("/tipo-movilidad", authMiddleware, async (req, res) => {
  try {
    const result = await query("SELECT DISTINCT tipo_movilidad FROM users WHERE tipo_movilidad IS NOT NULL ORDER BY tipo_movilidad");
    const options = result.rows.map(r => r.tipo_movilidad).filter(Boolean);
    res.json({ success: true, data: options });
  } catch (error) {
    console.error("Error al obtener tipos de movilidad:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

// Obtener ciclos escolares únicos desde users
router.get("/ciclos", authMiddleware, async (req, res) => {
  try {
    const result = await query("SELECT DISTINCT ciclo_escolar FROM users WHERE ciclo_escolar IS NOT NULL ORDER BY ciclo_escolar");
    const options = result.rows.map(r => r.ciclo_escolar).filter(Boolean);
    res.json({ success: true, data: options });
  } catch (error) {
    console.error("Error al obtener ciclos escolares:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

module.exports = router;
