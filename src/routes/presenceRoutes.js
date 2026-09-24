const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const qrController = require('../controllers/qrController');
const { authorizeRole, authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

// Enregistrement du pointage (Accessible à tous les utilisateurs connectés)
router.post('/scan', presenceController.enregistrerPointage);
// Consultation de l'historique de présence (Accessible à tous les utilisateurs connectés)
router.get('/history', authorizeRole('COLLABORATEUR'), presenceController.getMonHistorique);
// Consultation de l'historique de présence par utilisateur (Accessible uniquement aux administrateurs et responsables)
router.get('/history/:idUtilisateur', authorizeRole('ADMIN','RESPONSABLE'), presenceController.getHistoriqueParUtilisateur);
// creation d'un QR code de présence (Accessible uniquement aux administrateurs et  responsables)
router.get('/today', authorizeRole("ADMIN", "RESPONSABLE"), qrController.getQRPresenceToday );
module.exports = router;