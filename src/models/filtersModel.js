const { query } = require("../config/database");

// Universidades
const getUniversidades = async () => {
  const result = await query("SELECT id, nombre FROM universidades ORDER BY nombre ASC");
  return result.rows;
};

// Facultades
const getFacultades = async () => {
  const result = await query("SELECT id, nombre FROM facultades ORDER BY nombre ASC");
  return result.rows;
};

// Carreras
const getCarreras = async () => {
  const result = await query("SELECT id, nombre FROM carreras ORDER BY nombre ASC");
  return result.rows;
};

// Becas
const getBecas = async () => {
  const result = await query("SELECT id, nombre FROM becas ORDER BY nombre ASC");
  return result.rows;
};

module.exports = {
  getUniversidades,
  getFacultades,
  getCarreras,
  getBecas
};
