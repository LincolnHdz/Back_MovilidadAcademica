const {
  getAllUsers,
  updateUserRole,
  validatePassword,
  findUserById,
  getUsersByFilters,
  updateUserField,
  createUser,
} = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { query } = require("../config/database");

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(({ password, ...u }) => u);
    res.status(200).json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const valid = ["alumno", "becarios", "administrador"];
    if (!valid.includes(rol))
      return res.status(400).json({ success: false, message: "Rol inválido" });

    const updated = await updateUserRole(id, rol);
    if (!updated)
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const { password, ...user } = updated;
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const user = await findUserById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const valid = await validatePassword(oldPassword, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserField(id, "password", hashed);
    res.status(200).json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const users = await getUsersByFilters(req.query);
    const sanitized = users.map(({ password, ...u }) => u);
    res.status(200).json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    const updated = await updateUserField(id, field, value);
    if (!updated)
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const { password, ...user } = updated;
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Trae al usuario base
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // 🔹 Trae datos relacionados (universidad, facultad, carrera, beca)
    const [universidad, facultad, carrera, beca] = await Promise.all([
      user.universidad_id
        ? query("SELECT id, nombre, pais FROM universidades WHERE id = $1", [user.universidad_id])
        : { rows: [] },
      user.facultad_id
        ? query("SELECT id, nombre FROM facultades WHERE id = $1", [user.facultad_id])
        : { rows: [] },
      user.carrera_id
        ? query("SELECT id, nombre FROM carreras WHERE id = $1", [user.carrera_id])
        : { rows: [] },
      user.beca_id
        ? query("SELECT id, nombre, pais FROM becas WHERE id = $1", [user.beca_id])
        : { rows: [] },
    ]);

    // 🔹 Combina la información enriquecida
    const userDetail = {
      ...user,
      universidad: universidad.rows[0] || null,
      facultad: facultad.rows[0] || null,
      carrera: carrera.rows[0] || null,
      beca: beca.rows[0] || null,
    };

    delete userDetail.password; // seguridad

    return res.status(200).json({
      success: true,
      data: userDetail,
    });
  } catch (err) {
    console.error("Error al obtener detalles del usuario:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener detalles del usuario",
    });
  }
};

const importUsersController = async (req, res) => {
  try {
    console.log("=== Iniciando importación de usuarios ===");
    console.log("Body recibido:", JSON.stringify(req.body, null, 2));
    
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log(" Error: No se proporcionó un array válido de usuarios");
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un array de usuarios",
      });
    }

    console.log(` Total de usuarios a importar: ${users.length}`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Procesar cada usuario
    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      console.log(`\n--- Procesando usuario ${i + 1}/${users.length} ---`);
      console.log("Datos del usuario:", JSON.stringify(userData, null, 2));
      
      try {
        // Validar solo los campos requeridos según la base de datos
        if (!userData.nombres || !userData.email || !userData.password) {
          throw new Error("Faltan campos requeridos (nombres, email o password)");
        }

        // Crear el usuario
        console.log(`Intentando crear usuario: ${userData.email}`);
        await createUser(userData);
        console.log(` Usuario creado exitosamente: ${userData.email}`);
        results.successful++;
      } catch (error) {
        console.error(` Error al crear usuario ${i + 1}:`, error);
        results.failed++;
        
        // Detectar error de duplicado específico
        let errorMessage = error.message;
        if (error.message.includes("ya existe")) {
          errorMessage = `Email o clave duplicada`;
        } else if (error.code === "23505") {
          errorMessage = `Email o clave ya existe en el sistema`;
        }
        
        results.errors.push(
          `Usuario ${i + 1} (${userData.nombres || 'sin nombre'} - ${userData.email || 'sin email'}): ${errorMessage}`
        );
      }
    }

    console.log("\n=== Resumen de importación ===");
    console.log(` Exitosos: ${results.successful}`);
    console.log(` Fallidos: ${results.failed}`);
    if (results.errors.length > 0) {
      console.log("Errores:", results.errors);
    }

    return res.status(200).json({
      success: true,
      message: `Importación completada. ${results.successful} exitosos, ${results.failed} fallidos`,
      ...results,
    });
  } catch (err) {
    console.error(" Error crítico en importación de usuarios:", err);
    console.error("Stack trace:", err.stack);
    return res.status(500).json({
      success: false,
      message: "Error al importar usuarios",
      error: err.message,
    });
  }
};

module.exports = {
  getAllUsersController,
  updateRole,
  changePassword,
  searchUsers,
  updateField,
  getUserByIdController,
  importUsersController,
};
