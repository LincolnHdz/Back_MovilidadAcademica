const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. No se proporcionó token de autorización.",
      });
    }

    // extraer el token
    const token = authHeader.substring(7); // Eliminar "Bearer " del inicio
    // verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. Usuario no encontrado.",
      });
    }

    // agregar informacion del usuario al objeto req
    req.user = { 
      id: user.id,
      clave: user.clave,
      rol: user.rol
    };
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// middleware para verificar roles
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await findUserById(req.user.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado.",
        });
      }

      if (!roles.includes(user.rol)) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Permisos insuficientes.",
        });
      }

      req.userRole = user.rol;
      next();
    } catch (error) {
      console.error("Error en requireRole:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
