const express = require('express');
const router = express.Router();
const equipementController = require('../controllers/equipementController');
const { authorizeRole, authenticateToken } = require('../middlewares/auth');
const upload = require('../config/multer');

// Authentification requise pour interagir avec le matériel
router.use(authenticateToken);

// Récupération de tous les équipements (Dashboard web)
router.get('/', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.getAllEquipements);

// Récupération d'un équipement par son ID
router.get('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.getEquipementById);

// Création d'un équipement (avec génération automatique du QRCode)
router.post('/', authorizeRole('ADMIN'), upload.single('photoEquipement'),equipementController.createEquipement);

// Récupération par Scan QR Code (Méthode scannerQRCode du Collaborateur)
router.get('/qr/:qrValue',authorizeRole('COLLABORATEUR'), equipementController.getEquipementByQR);

module.exports = router;