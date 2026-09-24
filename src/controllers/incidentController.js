const { Incident, Notification } = require('../models');

exports.creerIncident = async (req, res) => {
  try {
    const { sujet, categorie, niveauUrgence, details, idEquipement, idMission } = req.body;
    const idUtilisateur = req.user.idUtilisateur;

    // validation des champs obligatoires

    if (!sujet || !categorie || !niveauUrgence) {
      // nettoyer les fichiers si validation échoue
      if (req.files?.length) {
        req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      }
      return res.status(400).json({
        message: 'Sujet, catégorie et niveau d’urgence sont obligatoires.',
      });
    }
       const fichiersJoints = (req.files || []).map(
      (f) => `/uploads/incidents/${f.filename}`
    );

    const incident = await Incident.create({
      sujet,
      categorie,
      niveauUrgence,
      details:details||null,
      dateSignalement: new Date(),
      statutResolution: 'OUVERT',
      fichierJoint: JSON.stringify(fichiersJoints),
      idUtilisateur,
      idEquipement: idEquipement || null,
      idMission: idMission || null
    });

    // 🔔 Notification automatique pour les responsables et admins
    await Notification.create({
      titre: 'Nouveau signalement d\'incident',
      message: `Incident "${sujet}" signalé par un collaborateur.`,
      type: 'INCIDENT',
      idUtilisateur: null // Accessible par les admins/responsables
    });

    res.status(201).json({
      message: 'Incident signalé avec succès.', incident: {
        ...incident.toJSON(),
        fichierJoint: fichiersJoints, // renvoie un vrai tableau côté client
      },
    });
  } catch (error) {
       if (req.files?.length) {
      req.files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { User } = require('../models');
    const incidents = await Incident.findAll({ 
      include: [{ model: User, as: 'signaleur', attributes: ['idUtilisateur', 'nom', 'prenom', 'email'] }],
      order: [['dateSignalement', 'DESC']] 
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const { User } = require('../models');
    const incident = await Incident.findByPk(req.params.id, {
      include: [{ model: User, as: 'signaleur', attributes: ['idUtilisateur', 'nom', 'prenom', 'email'] }]
    });
    if (!incident) return res.status(404).json({ message: 'Incident non trouvé' });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateStatutIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { statutResolution } = req.body; // 'EN_COURS' ou 'RESOLU'

    const incident = await Incident.findByPk(id);
    if (!incident) return res.status(404).json({ message: 'Incident non trouvé.' });

    incident.statutResolution = statutResolution;
    await incident.save();

    res.json({ message: 'Statut mis à jour.', incident });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};