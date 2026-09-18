const { CompteRendu, Notification } = require('../models');

exports.creerCompteRendu = async (req, res) => {
  try {
    const { contenu, idMission } = req.body;
    const idUtilisateur = req.user.idUtilisateur;

    const cr = await CompteRendu.create({
      contenu,
      idMission,
      idUtilisateur
    });

    res.status(201).json({ message: 'Compte rendu soumis avec succès.', compteRendu: cr });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.validerCompteRendu = async (req, res) => {
  try {
    const { id } = req.params;
    const cr = await CompteRendu.findByPk(id);
    if (!cr) return res.status(404).json({ message: 'Compte rendu introuvable.' });

    cr.estValide = true;
    await cr.save();

    // 🔔 Notification envoyée au collaborateur
    await Notification.create({
      titre: 'Compte rendu validé',
      message: 'Votre compte rendu de mission a été validé par votre responsable.',
      type: 'COMPTE_RENDU',
      idUtilisateur: cr.idUtilisateur
    });

    res.json({ message: 'Compte rendu validé.', compteRendu: cr });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getCompteRendusByMission = async (req, res) => {
  try {
    const { idMission } = req.params;
    const liste = await CompteRendu.findAll({ where: { idMission } });
    res.json(liste);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};