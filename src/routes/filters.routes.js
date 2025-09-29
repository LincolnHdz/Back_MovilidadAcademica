const express = require("express");
const router = express.Router();
const {
  getUniversidades,
  getFacultades,
  getCarreras,
  getBecas
} = require("../models/filtersModel");

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

module.exports = router;
