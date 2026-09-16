const { Mission, User, Affectation } = require('../models');

// 1. Créer une mission (Admin ou Responsable)
exports.createMission = async (req, res) => {
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
      responsableId: req.user.id,
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
  try {
    const missions = await Mission.findAll({
      include: [
        { model: User, as: 'createur', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: User, as: 'agents', attributes: ['id', 'nom', 'prenom', 'role'], through: { attributes: ['role', 'dateAffectation'] } },
      ],
    });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 3. Récupérer une mission par ID
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id, {
      include: [
        { model: User, as: 'responsable', attributes: ['id', 'nom', 'prenom', 'email'] },
        { 
          model: Affectation, 
          as: 'affectations',
          include: [
            {
              model: User,
              as: 'collaborateur',
              attributes: ['id', 'nom', 'prenom', 'role']
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

    const affectation = await Affectation.create({
      missionId,
      collaborateurId: userId,
      role: role || 'MEMBRE',
    });

    res.status(201).json({
      message: 'Utilisateur affecté avec succès à la mission',
      affectation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};