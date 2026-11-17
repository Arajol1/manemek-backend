const { HistoriqueActivite } = require('../models');

/**
 * Enregistre une activité dans la table d'audit
 */
exports.enregistrerActivite = async ({
  idUtilisateur,
  action,
  description,
  typeEntite = null,
  idEntite = null,
  metadata = null,
}) => {
  try {
    if (!idUtilisateur || !action || !description) {
      console.warn('[auditService] Données incomplètes pour enregistrer une activité', { idUtilisateur, action });
      return null;
    }

    const log = await HistoriqueActivite.create({
      idUtilisateur: Number(idUtilisateur),
      action,
      description,
      typeEntite,
      idEntite: idEntite ? String(idEntite) : null,
      metadata,
      createdAt: new Date(),
    });

    console.info(`[auditService] Activité enregistrée : [${action}] pour l'utilisateur ${idUtilisateur}`);
    return log;
  } catch (error) {
    console.error('[auditService] Erreur lors de l\'enregistrement de l\'activité:', error);
    return null;
  }
};
