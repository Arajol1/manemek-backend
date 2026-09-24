const express = require('express');
const router = express.Router();
const { authorizeRole, authenticateToken } = require('../middlewares/auth');

const compteRenduController = require('../controllers/compteRenduController');

// Authentification requise pour interagir avec les comptes rendus
router.use(authenticateToken);

// Création d'un compte rendu
router.post('/', authorizeRole('COLLABORATEUR','RESPONSABLE'), compteRenduController.creerCompteRendu);

// Validation d'un compte rendu
router.put('/:id/valider', authorizeRole('RESPONSABLE','ADMIN'), compteRenduController.validerCompteRendu);

// Récupération des comptes rendus par mission
router.get('/mission/:idMission', authorizeRole('RESPONSABLE', 'ADMIN'), compteRenduController.getCompteRendusByMission);
module.exports = router;