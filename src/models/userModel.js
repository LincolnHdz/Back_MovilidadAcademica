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

  try {
    await query(createTableQuery);
    console.log("Tabla users creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla users:", error);
    throw error;
  }
};

const createUser = async (userData) => {
  const { 
    nombres, 
    apellido_paterno, 
    apellido_materno, 
    clave, 
    telefono, 
    email, 
    password, 
    rol,
    tipo_movilidad,
    ciclo_escolar,
    universidad_id,
    facultad_id,
    carrera_id,
    beca_id
  } = userData;

  try {
    // Validar si el usuario ya existe por email o clave
    const existingUser = await query(
      "SELECT * FROM users WHERE email = $1 OR (clave = $2 AND clave IS NOT NULL)",
      [email, clave]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("El usuario ya existe con ese email o clave");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await query(
      "INSERT INTO users (nombres, apellido_paterno, apellido_materno, clave, telefono, email, password, rol, tipo_movilidad, ciclo_escolar, universidad_id, facultad_id, carrera_id, beca_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
      [nombres, apellido_paterno, apellido_materno, clave, telefono, email, hashedPassword, rol, tipo_movilidad, ciclo_escolar, universidad_id, facultad_id, carrera_id, beca_id]
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

const updateUserTipoMovilidad = async (id, tipo_movilidad) => {
  try {
    // Validar el tipo de movilidad
    const tiposValidos = ['movilidad_internacional', 'movilidad_virtual', 'visitante_nacional', 'visitante_internacional'];
    if (tipo_movilidad && !tiposValidos.includes(tipo_movilidad)) {
      throw new Error('Tipo de movilidad no válido');
    }

    const result = await query(
      "UPDATE users SET tipo_movilidad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [tipo_movilidad, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar el tipo de movilidad del usuario:", error);
    throw error;
  }
};

const getUsersByFilters = async (filters = {}) => {
  try {
    const clauses = [];
    const params = [];
    let idx = 1;

    if (filters.universidad_id !== undefined && filters.universidad_id !== null && filters.universidad_id !== "") {
      clauses.push(`universidad_id = $${idx++}`);
      params.push(filters.universidad_id);
    }
    if (filters.facultad_id !== undefined && filters.facultad_id !== null && filters.facultad_id !== "") {
      clauses.push(`facultad_id = $${idx++}`);
      params.push(filters.facultad_id);
    }
    if (filters.carrera_id !== undefined && filters.carrera_id !== null && filters.carrera_id !== "") {
      clauses.push(`carrera_id = $${idx++}`);
      params.push(filters.carrera_id);
    }
    if (filters.beca_id !== undefined && filters.beca_id !== null && filters.beca_id !== "") {
      clauses.push(`beca_id = $${idx++}`);
      params.push(filters.beca_id);
    }

    // nuevos filtros textuales
    if (filters.tipo_movilidad !== undefined && filters.tipo_movilidad !== null && filters.tipo_movilidad !== "") {
      clauses.push(`tipo_movilidad = $${idx++}`);
      params.push(filters.tipo_movilidad);
    }
    if (filters.ciclo_escolar !== undefined && filters.ciclo_escolar !== null && filters.ciclo_escolar !== "") {
      clauses.push(`ciclo_escolar = $${idx++}`);
      params.push(filters.ciclo_escolar);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT * FROM users ${where} ORDER BY id`;
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener usuarios por filtros:", error);
    throw error;
  }
};

module.exports = {
  createUserTable,
  createUser,
  /**
   * Actualiza la contraseña de un usuario y la hashea antes de guardar.
   * @param {number} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña en texto plano
   * @returns {Promise<object>} Usuario actualizado sin la contraseña
   */
  updateUserPassword: async (id, newPassword) => {
    try {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await query(
        "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [hashedPassword, id]
      );
      // Remover la contraseña antes de retornar
      const { password, ...userWithoutPassword } = result.rows[0];
      return userWithoutPassword;
    } catch (error) {
      console.error("Error al actualizar la contraseña del usuario:", error);
      throw error;
    }
  },
  findUserByEmail,
  findUserByClave,
  findUserById,
  getAllUsers,
  getUsersByRole,
  updateUserTipoMovilidad,
  validatePassword,
  updateUserRole,
  
  /**
   * Actualiza el teléfono de un usuario.
   * @param {number} id - ID del usuario
   * @param {string} telefono - Nuevo teléfono del usuario
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserTelefono: async (id, telefono) => {
    try {
      const result = await query(
        "UPDATE users SET telefono = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [telefono, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar el teléfono del usuario:", error);
      throw error;
    }
  },
  
  /**
   * Actualiza la universidad asociada a un usuario.
   * @param {number} id - ID del usuario
   * @param {number} universidad_id - ID de la universidad
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserUniversidad: async (id, universidad_id) => {
    try {
      const result = await query(
        "UPDATE users SET universidad_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [universidad_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar la universidad del usuario:", error);
      throw error;
    }
  },
  
  /**
   * Actualiza la facultad asociada a un usuario.
   * @param {number} id - ID del usuario
   * @param {number} facultad_id - ID de la facultad
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserFacultad: async (id, facultad_id) => {
    try {
      const result = await query(
        "UPDATE users SET facultad_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [facultad_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar la facultad del usuario:", error);
      throw error;
    }
  },
  
  /**
   * Actualiza la carrera asociada a un usuario.
   * @param {number} id - ID del usuario
   * @param {number} carrera_id - ID de la carrera
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserCarrera: async (id, carrera_id) => {
    try {
      const result = await query(
        "UPDATE users SET carrera_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [carrera_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar la carrera del usuario:", error);
      throw error;
    }
  },
  
  /**
   * Actualiza la beca asociada a un usuario.
   * @param {number} id - ID del usuario
   * @param {number} beca_id - ID de la beca
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserBeca: async (id, beca_id) => {
    try {
      const result = await query(
        "UPDATE users SET beca_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [beca_id, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar la beca del usuario:", error);
      throw error;
    }
  },

  /**
   * Actualiza el ciclo escolar de un usuario.
   * @param {number} id - ID del usuario
   * @param {string} ciclo_escolar - Ciclo escolar (ej: "2024-2025")
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserCicloEscolar: async (id, ciclo_escolar) => {
    try {
      const result = await query(
        "UPDATE users SET ciclo_escolar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [ciclo_escolar, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar el ciclo escolar del usuario:", error);
      throw error;
    }
  },

  /**
   * Actualiza la clave de un usuario.
   * @param {number} id - ID del usuario
   * @param {string} clave - Nueva clave del estudiante
   * @returns {Promise<object>} Usuario actualizado
   */
  updateUserClave: async (id, clave) => {
    try {      
      // Validar que la clave no esté ya en uso si no está vacía
      if (clave && clave.trim() !== '') {
        const existingUser = await query(
          "SELECT id FROM users WHERE clave = $1 AND id != $2",
          [clave, id]
        );
        
        if (existingUser.rows.length > 0) {
          throw new Error("La clave ya está en uso por otro usuario");
        }
      }

      const result = await query(
        "UPDATE users SET clave = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [clave || null, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error al actualizar la clave del usuario:", error);
      
      // Manejar errores específicos de PostgreSQL
      if (error.code === '23505') { // Unique constraint violation
        throw new Error("La clave ya está en uso por otro usuario");
      }
      
      throw error;
    }
  },

  getUsersByFilters,
};
