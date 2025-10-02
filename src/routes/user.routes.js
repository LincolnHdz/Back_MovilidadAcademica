const express = require("express");
const { query } = require("../config/database");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { 
  getAllUsers, 
  updateUserRole, 
  updateUserTelefono, 
  updateUserPassword, 
  findUserById,
  updateUserUniversidad,
  updateUserFacultad,
  updateUserCarrera,
  updateUserBeca,
  validatePassword,
  updateUserTipoMovilidad,
  getUsersByFilters // <-- agregado
} = require("../models/userModel");
const router = express.Router();

// Actualizar datos del perfil del usuario (admin o el propio usuario)
// Ruta para actualizar el tipo de movilidad del usuario
router.patch(
  "/:id/tipo-movilidad",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo_movilidad } = req.body;
      
      // Permitir solo si es el propio usuario o admin
      if (req.user.id.toString() !== id && req.user.rol !== "administrador") {
        return res.status(403).json({ success: false, message: "No tienes permiso para actualizar este perfil" });
      }
      
      const tiposValidos = ['movilidad_internacional', 'movilidad_virtual', 'visitante_nacional', 'visitante_internacional', null];
      if (tipo_movilidad !== undefined && tipo_movilidad !== null && !tiposValidos.includes(tipo_movilidad)) {
        return res.status(400).json({ success: false, message: "Tipo de movilidad inválido" });
      }
      
      // Actualizar tipo de movilidad
      const updated = await updateUserTipoMovilidad(id, tipo_movilidad);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      
      const { password, ...user } = updated;
      res.status(200).json({ success: true, data: user, message: "Tipo de movilidad actualizado correctamente" });
    } catch (error) {
      console.error("Error actualizando tipo de movilidad:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

router.patch(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { telefono, universidad_id, facultad_id, carrera_id, beca_id } = req.body;
      
      // Permitir solo si es el propio usuario o admin
      if (req.user.id.toString() !== id && req.user.rol !== "administrador") {
        return res.status(403).json({ success: false, message: "No tienes permiso para actualizar este perfil" });
      }
      
      // Actualizar usuario en la base de datos
      let updated;
      if (telefono !== undefined) {
        if (!telefono || typeof telefono !== "string" || telefono.length < 7) {
          return res.status(400).json({ success: false, message: "Teléfono inválido" });
        }
        updated = await updateUserTelefono(id, telefono);
      } else if (universidad_id !== undefined) {
        updated = await updateUserUniversidad(id, universidad_id);
      } else if (facultad_id !== undefined) {
        updated = await updateUserFacultad(id, facultad_id);
      } else if (carrera_id !== undefined) {
        updated = await updateUserCarrera(id, carrera_id);
      } else if (beca_id !== undefined) {
        updated = await updateUserBeca(id, beca_id);
      } else {
        return res.status(400).json({ success: false, message: "No se proporcionó ningún campo para actualizar" });
      }
      
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      
      const { password, ...user } = updated;
      res.status(200).json({ success: true, data: user, message: "Perfil actualizado correctamente" });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Ruta para cambiar la contraseña del usuario
router.post(
  "/:id/cambiar-password",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Permitir solo si es el propio usuario o admin
      if (req.user.id.toString() !== id && req.user.rol !== "administrador") {
        return res.status(403).json({ success: false, message: "No tienes permiso para cambiar esta contraseña" });
      }
      
      // Validar que se proporcionen ambas contraseñas
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Debes proporcionar la contraseña actual y la nueva" });
      }
      
      // Validar contraseña actual
      const user = await findUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      
      const isValidPassword = await validatePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });
      }
      
      // Actualizar la contraseña
      const updatedUser = await updateUserPassword(id, newPassword);
      
      res.status(200).json({ 
        success: true, 
        message: "Contraseña actualizada correctamente" 
      });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Ruta de prueba
router.get("/", (req, res) => {
  res.send("Ruta /api/users funcionando ✅");
});


router.get("/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time");
    res.json({
      success: true,
      message: "Conexión a base de datos exitosa",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en consulta de prueba:", error);
    res.status(500).json({
      success: false,
      message: "Error al conectar con la base de datos",
      error: error.message,
    });
  }
});

// Admin: listar todos los usuarios
router.get("/all", authMiddleware, requireRole(["administrador"]), async (req, res) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(({ password, ...u }) => u);
    res.status(200).json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Admin: actualizar rol de un usuario
router.patch(
  "/:id/rol",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rol } = req.body;
      const validRoles = ["alumno", "becarios", "administrador"];
      if (!validRoles.includes(rol)) {
        return res.status(400).json({ success: false, message: "Rol inválido" });
      }
      const updated = await updateUserRole(id, rol);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      const { password, ...user } = updated;
      res.status(200).json({ success: true, data: user, message: "Rol actualizado" });
    } catch (error) {
      console.error("Error actualizando rol:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Admin o usuario: actualizar tipo de movilidad
router.patch(
  "/:id/tipo-movilidad",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo_movilidad } = req.body;

      // Verificar que el usuario esté actualizando su propio perfil o sea admin
      if (req.user.id.toString() !== id && req.user.rol !== "administrador") {
        return res.status(403).json({ 
          success: false, 
          message: "No tienes permiso para actualizar este perfil" 
        });
      }

      // Validar tipo de movilidad
      const tiposValidos = ['movilidad_internacional', 'movilidad_virtual', 'visitante_nacional', 'visitante_internacional', null];
      if (!tiposValidos.includes(tipo_movilidad)) {
        return res.status(400).json({ 
          success: false, 
          message: "Tipo de movilidad no válido" 
        });
      }

      const updated = await updateUserTipoMovilidad(id, tipo_movilidad);
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      const { password, ...user } = updated;
      res.status(200).json({ 
        success: true, 
        data: user, 
        message: "Tipo de movilidad actualizado" 
      });
    } catch (error) {
      console.error("Error actualizando tipo de movilidad:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  }
);

// Cambiar contraseña (solo puede cambiar su propia contraseña)
router.patch(
  "/:id/password",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      // Verificar que el usuario esté actualizando su propia contraseña
      if (req.user.id.toString() !== id) {
        return res.status(403).json({ 
          success: false, 
          message: "No tienes permiso para cambiar la contraseña de otro usuario" 
        });
      }

      // Verificar si se proporcionaron las contraseñas
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Se requiere la contraseña actual y la nueva contraseña" 
        });
      }

      // Verificar si la contraseña nueva es válida
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "La nueva contraseña debe tener al menos 6 caracteres" 
        });
      }

      // Obtener el usuario actual para verificar la contraseña antigua
      const user = await findUserById(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      // Verificar que la contraseña actual sea correcta
      const bcrypt = require("bcryptjs");
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: "La contraseña actual no es correcta" 
        });
      }

      // Actualizar la contraseña
      const updatedUser = await updateUserPassword(id, newPassword);
      
      res.status(200).json({ 
        success: true, 
        data: updatedUser, 
        message: "Contraseña actualizada correctamente" 
      });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  }
);

// Búsqueda por filtros (admin)
router.get(
  "/search",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const { universidad_id, facultad_id, carrera_id, beca_id } = req.query;
      const filters = {
        universidad_id: universidad_id !== undefined ? (universidad_id === "" ? undefined : parseInt(universidad_id, 10)) : undefined,
        facultad_id: facultad_id !== undefined ? (facultad_id === "" ? undefined : parseInt(facultad_id, 10)) : undefined,
        carrera_id: carrera_id !== undefined ? (carrera_id === "" ? undefined : parseInt(carrera_id, 10)) : undefined,
        beca_id: beca_id !== undefined ? (beca_id === "" ? undefined : parseInt(beca_id, 10)) : undefined,
      };

      const users = await getUsersByFilters(filters);
      const sanitized = users.map(({ password, ...u }) => u);
      res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
      console.error("Error buscando usuarios por filtros:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }
);

module.exports = router;
