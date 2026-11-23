const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Toutes les routes nécessitent d'être connecté
router.use(authenticateToken);

// Consultation des missions (Accessible à tous les utilisateurs connectés)
router.get('/', missionController.getAllMissions);
router.get('/check-retards', missionController.verifierRetardsRestitution);
router.get('/:id', missionController.getMissionById);

// Création, mise à jour et affectation (Admin et Responsable)
router.post('/', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.createMission);
router.put('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.updateMission);
router.post('/:missionId/affect', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.affectUserToMission);
router.delete('/:missionId/affect/:collaborateurId', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.removeUserFromMission);

// suppression d'une mission (Admin et Responsable)
router.delete('/:id', authorizeRole('ADMIN', 'RESPONSABLE'), missionController.deleteMission);
module.exports = router;