const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getAllUsersController,
  updateRole,
  changePassword,
  searchUsers,
  updateField,
  getUserByIdController,
  importUsersController,
} = require("../controllers/user.controllers");

router.get("/", (req, res) => res.send("Ruta /api/users funcionando"));
router.get("/all", authMiddleware, requireRole(["administrador"]), getAllUsersController);
router.post("/import", authMiddleware, requireRole(["administrador"]), importUsersController);
router.patch("/:id/rol", authMiddleware, requireRole(["administrador"]), updateRole);
router.patch("/:id/field", authMiddleware, updateField);
router.patch("/:id/password", authMiddleware, changePassword);
router.get("/search", authMiddleware, requireRole(["administrador"]), searchUsers);
router.get("/:id", authMiddleware, getUserByIdController);

module.exports = router;
