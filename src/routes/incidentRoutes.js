const express = require('express');
const router = express.Router();
const { authorizeRole, authenticateToken } = require('../middlewares/auth');

const incidentController = require('../controllers/incidentController');
const upload = require('../config/multer');

// Authentification requise pour interagir avec les incidents
router.use(authenticateToken);

// creation d'un incident
router.post('/',upload.array('fichierJoint',3), incidentController.creerIncident);

// récupération de tous les incidents
router.get('/', authorizeRole('ADMIN', 'RESPONSABLE'), incidentController.getIncidents);
// mise à jour du statut d'un incident
router.put('/:id/statutResolution', authorizeRole('ADMIN', 'RESPONSABLE'), incidentController.updateStatutIncident);
module.exports = router;