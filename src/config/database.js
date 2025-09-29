const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(" Conexión a PostgreSQL exitosa");
    const result = await client.query("SELECT NOW()");
    console.log(" Tiempo del servidor:", result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error(" Error conectando a PostgreSQL:", err.message);
    return false;
  }
};

const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Consulta ejecutada:", { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error("Error en consulta:", {
      text,
      error: err.message,
      code: err.code,
      detail: err.detail,
      position: err.position,
      stack: err.stack
    });
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
