const express = require('express');
const router = express.Router();
const equipementController = require('../controllers/equipementController');
const { authorizeRole, authenticateToken } = require('../middlewares/auth');
const upload = require('../config/multer');

// Authentification requise pour interagir avec le matériel
router.use(authenticateToken);

// Récupération de tous les équipements (Dashboard web)
router.get('/', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.getAllEquipements);

// Récupération des catégories d'équipements prédéfinies
router.get('/categories', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.getCategories);

// Récupération d'un équipement par son ID
router.get('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.getEquipementById);

// Création d'un équipement
router.post('/', authorizeRole('ADMIN', 'RESPONSABLE'), upload.single('photoEquipement'), equipementController.createEquipement);

// Mise à jour d'un équipement
router.put('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), upload.single('photoEquipement'), equipementController.updateEquipement);

// Reclasser / dégrader une quantité d'équipements vers un autre état
router.post('/:id/reclasser', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.reclasserEquipement);

// Suppression (totale ou partielle avec quantité) d'un équipement
router.delete('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), equipementController.deleteEquipement);

module.exports = router;