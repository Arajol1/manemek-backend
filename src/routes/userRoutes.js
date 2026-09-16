const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Public
router.post('/auth/login', userController.login);

// Authentifié (Tout utilisateur connecté)
router.get('/auth/me', authenticateToken, userController.getMe);

// Gestion Utilisateurs (Admin & Responsable)
router.get('/users', authenticateToken, authorizeRole('ADMIN', 'RESPONSABLE'), userController.getAllUsers);
router.post('/users', authenticateToken, authorizeRole('ADMIN'), userController.createUser);

module.exports = router;