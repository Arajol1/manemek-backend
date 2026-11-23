const { Mission, User, Affectation, MouvementEquipement, CompteRendu, Incident, Notification } = require('../models');

// 1. Créer une mission (Admin ou Responsable)
exports.createMission = async (req, res) => {
  console.info(`[missionController.js] - createMission : en cours...`);
  try {
    const { titre, description, dateDebut, dateFin, statut, priorite, localisation, equipements, collaborateurs } = req.body;

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

    // Affectation directe des collaborateurs choisis à la création
    if (Array.isArray(collaborateurs) && collaborateurs.length > 0) {
      for (const col of collaborateurs) {
        const colId = typeof col === 'object' ? col.idUtilisateur : col;
        if (!colId) continue;
        await Affectation.create({
          missionId: mission.idMission,
          collaborateurId: colId,
          fonction: (typeof col === 'object' && col.fonction) || 'MEMBRE',
        });
        await Notification.create({
          titre: 'Nouvelle affectation de mission',
          message: `Vous avez été affecté(e) à la mission "${mission.titre}". Localisation : ${mission.localisation || 'Non spécifiée'}.`,
          type: 'MISSION',
          idUtilisateur: colId,
          estLue: false,
        });
      }
    }

    // Affectation directe des équipements choisis
    const { Equipement } = require('../models');
    if (Array.isArray(equipements) && equipements.length > 0) {
      for (const item of equipements) {
        if (!item.idEquipement) continue;
        const eq = await Equipement.findByPk(item.idEquipement);
        if (eq) {
          const qte = Math.min(parseInt(item.quantite, 10) || 1, eq.quantite);
          await MouvementEquipement.create({
            idMission: mission.idMission,
            idEquipement: eq.idEquipement,
            idUtilisateur: req.user.idUtilisateur,
            type: 'SORTIE',
            etatAvant: eq.etat,
            etatApres: eq.etat,
            commentaire: `Affectation mission ${mission.titre} (${qte} unité(s))`
          });
        }
      }
    }

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
    const { Equipement } = require('../models');
    const missions = await Mission.findAll({
      include: [
        { model: User, as: 'responsable', attributes: ['idUtilisateur', 'nom', 'prenom', 'email', 'avatarUri'] },
        {
          model: Affectation,
          as: 'affectations',
          include: [{ model: User, as: 'collaborateur', attributes: ['idUtilisateur', 'nom', 'prenom', 'role', 'avatarUri'] }]
        },
        {
          model: MouvementEquipement,
          include: [{ model: Equipement }]
        }
      ],
      order: [['createdAt', 'DESC']]
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
    const { Equipement } = require('../models');
    const mission = await Mission.findByPk(req.params.id, {
      include: [
        { model: User, as: 'responsable', attributes: ['idUtilisateur', 'nom', 'prenom', 'email', 'avatarUri'] },
        { 
          model: Affectation, 
          as: 'affectations',
          include: [
            {
              model: User,
              as: 'collaborateur',
              attributes: ['idUtilisateur', 'nom', 'prenom', 'role', 'avatarUri']
            }
          ]
        },
        {
          model: MouvementEquipement,
          include: [{ model: Equipement }]
        }
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

    // Création de la notification pour le collaborateur affecté
    try {
      await Notification.create({
        titre: 'Nouvelle affectation de mission',
        message: `Vous avez été affecté(e) à la mission "${mission.titre}" en tant que ${role || 'MEMBRE'}. Localisation : ${mission.localisation || 'Non spécifiée'}.`,
        type: 'MISSION',
        idUtilisateur: userId,
        estLue: false,
      });
    } catch (notifErr) {
      console.warn('[missionController] Erreur création notification affectation :', notifErr.message);
    }

    res.status(201).json({
      message: 'Utilisateur affecté avec succès à la mission',
      affectation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 4.1 Retirer un utilisateur d'une mission
exports.removeUserFromMission = async (req, res) => {
  console.info(`[missionController.js] - removeUserFromMission : en cours...`);
  try {
    const { missionId, collaborateurId } = req.params;
    const mission = await Mission.findByPk(missionId);

    const deleted = await Affectation.destroy({
      where: {
        missionId,
        collaborateurId,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Affectation introuvable pour ce collaborateur.' });
    }

    // Création de la notification de retrait
    if (mission) {
      try {
        await Notification.create({
          titre: 'Retrait d\'une mission',
          message: `Vous avez été retiré(e) de la mission "${mission.titre}".`,
          type: 'MISSION',
          idUtilisateur: collaborateurId,
          estLue: false,
        });
      } catch (notifErr) {
        console.warn('[missionController] Erreur création notification retrait :', notifErr.message);
      }
    }

    res.json({ message: 'Collaborateur retiré de la mission avec succès.' });
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
