const express = require('express');
const router = express.Router();
const { authorizeRole, authenticateToken } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// Authentification requise pour interagir avec les notifications
router.use(authenticateToken);

// Récupération des notifications pour l'utilisateur connecté
router.get('/', notificationController.MesNotifications );

// Marquer une notification comme lue
router.put('/:id/lire', notificationController.marquerCommeLue);

module.exports = router;