const jwt = require("jsonwebtoken");

const {
  createUser,
  findUserByEmail,
  findUserByClave,
  findUserById,
  validatePassword,
} = require("../models/userModel");
const e = require("express");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// registro de usuario
const register = async (req, res) => {
  try {
    const { nombres, apellidos, clave, email, password } = req.body;

    //validaciones
    if (!nombres || !apellidos || !clave || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // recortar los espacios en blanco del correo
    const trimmedEmail = email.trim();
    // validar formato de correo axxxxxx@alumnos.uaslp, xxxx@uaslp.mx o cualquier otro dominio
    const emailRegex =
      /^(a\d{6}@alumnos\.uaslp\.mx|[^\s@]+@uaslp\.mx)|[^\s@]+@[^\s@]+\.[^\s@]$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.log("Correo recibido:", trimmedEmail);
      console.log("Resultado de la validación:", emailRegex.test(trimmedEmail));
      return res.status(400).json({
        success: false,
        message: "Formato de correo inválido",
      });
    }

    // Validar que la clave sea de 6 dígitos
    if (clave.length !== 6 || !/^\d{6}$/.test(clave)) {
      return res.status(400).json({
        success: false,
        message: "La clave debe ser de 6 dígitos",
      });
    }

    // asignar rol por defecto
    const rol = "alumno";
    const newUser = await createUser({
      nombres,
      apellidos,
      clave,
      telefono: null,
      email,
      password,
      rol,
    });

    // generar token
    const token = generateToken(newUser.id);
    const { password: _pw, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);

    if (error.message === "El usuario ya existe con ese email o clave") {
      return res.status(409).json({
        success: false,
        message: "Ya existe un usuario con ese correo o clave",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};

// Login de usuario (por correo o clave)
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // validaciones
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    let user;
    // determinar si el identificador es un correo o una clave
    if (identifier.includes("@")) {
      user = await findUserByEmail(identifier);
    } else {
      user = await findUserByClave(identifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // validar contraseña
    const isValidPassword = await validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // generar token
    const token = generateToken(user.id);
    // remover password del objeto user antes de enviarlo
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};

// obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const { password: _pw2, ...userNoPass } = user;
    res.status(200).json({
      success: true,
      data: {
        user: userNoPass,
        message: "Perfil obtenido exitosamente",
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};

// verificar token
const verifyToken = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        message: "Token valido",
      },
    });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  verifyToken,
};
