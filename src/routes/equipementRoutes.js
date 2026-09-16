const express = require('express');
const router = express.Router();
const equipementController = require('../controllers/equipementController');
const { authorizeRole, authenticateToken } = require('../middlewares/auth');

// Authentification requise pour interagir avec le matériel
router.use(authenticateToken);

// Création d'un équipement (avec génération automatique du QRCode)
router.post('/', authorizeRole('ADMIN'),equipementController.createEquipement);

// Récupération par Scan QR Code (Méthode scannerQRCode du Collaborateur)
router.get('/qr/:qrValue',authorizeRole('COLLABORATEUR'), equipementController.getEquipementByQR);

module.exports = router;