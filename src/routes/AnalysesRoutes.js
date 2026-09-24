const express = require('express');
const router = express.Router();
const analyseController =  require('../controllers/AnalyseController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

router.post

// Route pour générer une analyse IA (Accessible uniquement aux administrateurs et responsables)
router.post( '/', analyseController.genererAnalyse );

// Route pour récupérer toutes les analyses (Accessible uniquement aux administrateurs et responsables)
router.get( '/', authorizeRole( 'ADMIN', 'RESPONSABLE'), analyseController.getAnalyses );

//route pour recuperer une analyse par son id (Accessible uniquement aux administrateurs et responsables)
router.get( '/:id', authorizeRole( 'ADMIN', 'RESPONSABLE'), analyseController.getAnalyseById );

module.exports = router;