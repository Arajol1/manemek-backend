const { enregistrerActivite } = require('../services/auditService');

/**
 * Middleware d'audit automatique pour les requêtes modifiant des données
 */
const auditMiddleware = (actionType, entiteType = null, descriptionFormatter = null) => {
  return async (req, res, next) => {
    // Intercepter la fin de la requête avec res.on('finish')
    res.on('finish', async () => {
      // Uniquement si la requête a réussi (2xx) et que l'utilisateur est authentifié
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && req.user.idUtilisateur) {
        try {
          let description = '';
          if (typeof descriptionFormatter === 'function') {
            description = descriptionFormatter(req, res);
          } else if (descriptionFormatter) {
            description = descriptionFormatter;
          } else {
            description = `Action ${actionType} effectuée sur ${entiteType || req.baseUrl}`;
          }

          const targetUserId = req.params?.id || req.body?.idUtilisateur || req.body?.userId || req.user.idUtilisateur;

          await enregistrerActivite({
            idUtilisateur: targetUserId,
            action: actionType,
            description,
            typeEntite: entiteType,
            idEntite: req.params?.id || null,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              actorId: req.user.idUtilisateur,
            },
          });
        } catch (err) {
          console.error('[auditMiddleware] Erreur:', err);
        }
      }
    });

    next();
  };
};

module.exports = auditMiddleware;
