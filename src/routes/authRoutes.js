const express = require('express');
const router = express.Router();

const {
    register,
    login,
    getProfile,
    verifyToken
} = require('../controllers/authController');

// rutas publicas
router.post('/register', register);
router.post('/login', login);

// rutas privadas ( requieren autenticacion )
router.get('/profile', verifyToken, getProfile);
router.get('/verify', verifyToken);

module.exports = router;