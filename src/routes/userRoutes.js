const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const upload = require('../config/multer');

// Public
router.post('/auth/login', userController.login);
router.post( '/auth/activate', userController.activateAccount);
router.post( '/auth/resend-activation', userController.resendActivationCode );

// Authentifié (Tout utilisateur connecté)
router.get('/auth/me', authenticateToken, userController.getMe); // Récupère les informations de l'utilisateur connecté


// Gestion Utilisateurs (Admin & Responsable)
router.get('/users',authenticateToken, authorizeRole('ADMIN', 'RESPONSABLE'), userController.getAllUsers);
router.post('/users',  authenticateToken, authorizeRole('ADMIN'), userController.createUser);
router.put('/users/:id', authenticateToken, authorizeRole('ADMIN'), userController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole('ADMIN'), userController.deleteUser);

// updates pouvant être fait par l'utilisateur lui même
router.put('/users/:id/update', upload.single('photoProfil'), authenticateToken, userController.updateMe);
router.put('/auth/change-password', authenticateToken, userController.changePassword);

module.exports = router;