const { query } = require("../config/database");
const bcrypt = require("bcryptjs");

const createUserTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombres VARCHAR(255) NOT NULL,
        apellido_paterno VARCHAR(255) NOT NULL,
        apellido_materno VARCHAR(255) NOT NULL,
        clave VARCHAR(10) UNIQUE,
        telefono VARCHAR(15),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        rol VARCHAR(50) default 'alumno',
        tipo_movilidad VARCHAR(50) CHECK (tipo_movilidad IN ('movilidad_internacional', 'movilidad_virtual', 'visitante_nacional', 'visitante_internacional', NULL)),
        ciclo_escolar VARCHAR(20),
        universidad_id INTEGER REFERENCES universidades(id) ON DELETE SET NULL,
        facultad_id INTEGER REFERENCES facultades(id) ON DELETE SET NULL,
        carrera_id INTEGER REFERENCES carreras(id) ON DELETE SET NULL,
        beca_id INTEGER REFERENCES becas(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query(createTableQuery);
};

const createUser = async (userData) => {
  const {
    nombres, apellido_paterno, apellido_materno,
    clave, telefono, email, password, rol,
    tipo_movilidad, ciclo_escolar,
    universidad_id, facultad_id, carrera_id, beca_id
  } = userData;

  const existingUser = await query(
    "SELECT * FROM users WHERE email = $1 OR (clave = $2 AND clave IS NOT NULL)",
    [email, clave]
  );

  if (existingUser.rows.length > 0)
    throw new Error("El usuario ya existe con ese email o clave");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await query(
    "INSERT INTO users (nombres, apellido_paterno, apellido_materno, clave, telefono, email, password, rol, tipo_movilidad, ciclo_escolar, universidad_id, facultad_id, carrera_id, beca_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",
    [nombres, apellido_paterno, apellido_materno, clave, telefono, email, hashedPassword, rol, tipo_movilidad, ciclo_escolar, universidad_id, facultad_id, carrera_id, beca_id]
  );

  return newUser.rows[0];
};

const findUserByEmail = async (email) =>
  (await query("SELECT * FROM users WHERE email = $1", [email])).rows[0];

const findUserByClave = async (clave) =>
  (await query("SELECT * FROM users WHERE clave = $1", [clave])).rows[0];

const findUserById = async (id) =>
  (await query("SELECT * FROM users WHERE id = $1", [id])).rows[0];

const getAllUsers = async () =>
  (await query("SELECT * FROM users")).rows;

const getUsersByRole = async (rol) =>
  (await query("SELECT * FROM users WHERE rol = $1", [rol])).rows;

const updateUserRole = async (id, rol) =>
  (await query("UPDATE users SET rol=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *", [rol, id])).rows[0];

const validatePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

const updateUserField = async (id, field, value) => {
  const result = await query(
    `UPDATE users SET ${field} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [value, id]
  );
  return result.rows[0];
};

const getUsersByFilters = async (filters = {}) => {
  const clauses = [];
  const params = [];
  let idx = 1;

  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== "") {
      clauses.push(`${key} = $${idx++}`);
      params.push(val);
    }
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `SELECT * FROM users ${where} ORDER BY id`;
  return (await query(sql, params)).rows;
};

module.exports = {
  createUserTable,
  createUser,
  findUserByEmail,
  findUserByClave,
  findUserById,
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  validatePassword,
  updateUserField,
  getUsersByFilters,
};
