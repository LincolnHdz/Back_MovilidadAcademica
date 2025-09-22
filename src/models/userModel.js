const { query } = require("../config/database");
const bcrypt = require("bcryptjs");

const createUserTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombres VARCHAR(255) NOT NULL,
        apellidos VARCHAR(255) NOT NULL,
        clave VARCHAR(10) UNIQUE NOT NULL,
        telefono VARCHAR(15),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        rol VARCHAR(50) default 'alumno',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla users creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla users:", error);
    throw error;
  }
};

const createUser = async (userData) => {
  const { nombres, apellidos, clave, telefono, email, password, rol } =
    userData;

  try {
    // Validar si el usuario ya existe por email o clave
    const existingUser = await query(
      "SELECT * FROM users WHERE email = $1 OR clave = $2",
      [email, clave]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("El usuario ya existe con ese email o clave");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await query(
      "INSERT INTO users (nombres, apellidos, clave, telefono, email, password, rol) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombres, apellidos, clave, telefono, email, hashedPassword, rol]
    );

    return newUser.rows[0];
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al buscar el usuario por email:", error);
    throw error;
  }
};

const findUserByClave = async (clave) => {
  try {
    const result = await query("SELECT * FROM users WHERE clave = $1", [clave]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al buscar el usuario por clave:", error);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al buscar el usuario por ID:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const result = await query("SELECT * FROM users");
    return result.rows;
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    throw error;
  }
};

const getUsersByRole = async (rol) => {
  try {
    const result = await query("SELECT * FROM users WHERE rol = $1", [rol]);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener usuarios por rol:", error);
    throw error;
  }
};

const updateUserRole = async (id, rol) => {
  try {
    const result = await query(
      "UPDATE users SET rol = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [rol, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    throw error;
  }
};

const validatePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error al validar la contraseña:", error);
    throw error;
  }
};

module.exports = {
  createUserTable,
  createUser,
  findUserByEmail,
  findUserByClave,
  findUserById,
  getAllUsers,
  getUsersByRole,
  validatePassword,
  updateUserRole,
};
