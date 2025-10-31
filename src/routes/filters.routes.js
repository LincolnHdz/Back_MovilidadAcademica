const express = require("express");
const { query } = require("../config/database");
const router = express.Router();

// helper para safeQuery y log detallado
const safeQuery = async (sql, params = []) => {
  try {
    const res = await query(sql, params);
    return { ok: true, rows: res.rows };
  } catch (err) {
    console.error("SQL Error:", { sql, params, message: err.message, stack: err.stack });
    return { ok: false, error: err };
  }
};

// Universidades (público)
router.get("/universidades", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT id, nombre FROM universidades ORDER BY nombre");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener universidades", error: error.message });
  res.json({ success: true, data: rows });
});

// Facultades (público)
router.get("/facultades", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT id, nombre FROM facultades ORDER BY nombre");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener facultades", error: error.message });
  res.json({ success: true, data: rows });
});

// Carreras (público)
router.get("/carreras", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT id, nombre FROM carreras ORDER BY nombre");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener carreras", error: error.message });
  res.json({ success: true, data: rows });
});

// Becas (público)
router.get("/becas", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT id, nombre FROM becas ORDER BY nombre");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener becas", error: error.message });
  res.json({ success: true, data: rows });
});

// Obtener tipos de movilidad únicos desde users (público)
router.get("/tipo-movilidad", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT DISTINCT tipo_movilidad FROM users WHERE tipo_movilidad IS NOT NULL ORDER BY tipo_movilidad");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener tipos de movilidad", error: error.message });
  res.json({ success: true, data: rows.map(r => r.tipo_movilidad).filter(Boolean) });
});

// Obtener ciclos escolares únicos desde users (público)
router.get("/ciclos", async (req, res) => {
  const { ok, rows, error } = await safeQuery("SELECT DISTINCT ciclo_escolar FROM users WHERE ciclo_escolar IS NOT NULL ORDER BY ciclo_escolar");
  if (!ok) return res.status(500).json({ success: false, message: "Error al obtener ciclos", error: error.message });
  res.json({ success: true, data: rows.map(r => r.ciclo_escolar).filter(Boolean) });
});

module.exports = router;
