const { Mission, User, Affectation, MouvementEquipement, CompteRendu, Incident } = require('../models');

// 1. Créer une mission (Admin ou Responsable)
exports.createMission = async (req, res) => {
  console.info(`[missionController.js] - createMission : en cours...`);
  try {
    const { titre, description, dateDebut, dateFin, statut, priorite, localisation } = req.body;

    // Génération automatique du codeMission requis (ex: MIS-1710000000)
    const codeMission = `MIS-${Date.now()}`;

    const mission = await Mission.create({
      codeMission,
      titre,
      description,
      dateDebut,
      dateFin,
      statut: statut || 'PLANIFIEE',
      priorite: priorite || 'NORMALE',
      localisation,
      responsableId: req.user.idUtilisateur,
    });

    res.status(201).json({
      message: 'Mission créée avec succès',
      mission,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 2. Récupérer toutes les missions
exports.getAllMissions = async (req, res) => {
  console.info(`[missionController.js] - getAllMissions : en cours...`);
  try {
    const missions = await Mission.findAll({
      include: [
        { model: User, as: 'responsable', attributes: ['idUtilisateur', 'nom', 'prenom', 'email'] },
        {
          model: Affectation,
          as: 'affectations',
          include: [{ model: User, as: 'collaborateur', attributes: ['idUtilisateur', 'nom', 'prenom', 'role'] }]
        },
      ],
    });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 3. Récupérer une mission par ID
exports.getMissionById = async (req, res) => {
  console.info(`[missionController.js] - getMissionById : en cours...`);
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [
        { model: User, as: 'responsable', attributes: ['idUtilisateur', 'nom', 'prenom', 'email'] },
        { 
          model: Affectation, 
          as: 'affectations',
          include: [
            {
              model: User,
              as: 'collaborateur',
              attributes: ['idUtilisateur', 'nom', 'prenom', 'role']
            }
          ]
        },
      ],
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable.' });
    }

    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 4. Affecter un utilisateur à une mission
exports.affectUserToMission = async (req, res) => {
  console.info(`[missionController.js] - affectUserToMission : en cours...`);
  try {
    const { missionId } = req.params;
    const { userId, role } = req.body;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Vérifier si l'utilisateur est déjà affecté à cette mission
    const existingAffectation = await Affectation.findOne({
      where: {
        missionId,
        collaborateurId: userId,
      }
    });

    if (existingAffectation) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà affecté à cette mission.' });
    }

    const affectation = await Affectation.create({
      missionId,
      collaborateurId: userId,
      fonction: role || 'MEMBRE',
    });

    res.status(201).json({
      message: 'Utilisateur affecté avec succès à la mission',
      affectation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteMission = async (req, res) => {
  console.info(`[missionController.js] - deleteMission : en cours...`);
  try {
    const { id } = req.params;
    const mission = await Mission.findByPk(id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable.' });
    }

    // Supprimer les dépendances pour éviter les erreurs de clés étrangères
    await Affectation.destroy({ where: { missionId: id } });
    if (MouvementEquipement) {
      await MouvementEquipement.destroy({ where: { idMission: id } });
    }
    if (CompteRendu) {
      await CompteRendu.destroy({ where: { idMission: id } });
    }
    if (Incident) {
      await Incident.destroy({ where: { idMission: id } });
    }

    await mission.destroy();
    res.json({ message: 'Mission supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
