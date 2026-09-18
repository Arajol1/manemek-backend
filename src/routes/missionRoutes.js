const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Toutes les routes nécessitent d'être connecté
router.use(authenticateToken);

// Consultation des missions (Accessible à tous les utilisateurs connectés)
router.get('/', missionController.getAllMissions);
router.get('/:id', missionController.getMissionById);

// Création et affectation (Admin et Responsable uniquement)
router.post('/', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.createMission);
router.post('/:missionId/affect', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.affectUserToMission);

// suppression d'une mission (Admin uniquement)
router.delete('/:id', authorizeRole('ADMIN'), missionController.deleteMission);
module.exports = router;