const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

const {
  register,
  login,
  getProfile,
  verifyToken,
} = require("../controllers/auth.controllers");

// rutas publicas
router.post("/register", register);
router.post("/login", login);

// rutas privadas ( requieren autenticacion )
router.get("/profile", authMiddleware, getProfile);
router.get("/verify", authMiddleware, verifyToken);

module.exports = router;

