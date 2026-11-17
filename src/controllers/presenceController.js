const { calculerDistance } = require("../utils/geoUtils");
const { MouvementPresence, QRCode } = require("../models");

exports.enregistrerPointage = async (req, res) => {
  console.info(`[presenceController.js] - enregistrerPointage : en cours...`);
  try {
    const { qrValue, latitude, longitude, wifiSsid, justification } = req.body;

    const idUtilisateur = req.user.idUtilisateur; // Récupération de l'ID de l'utilisateur depuis le token JWT

    // 1. Vérifier les données reçues
    if (!qrValue || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "QR Code et position GPS obligatoires.",
      });
    }

    // 2. Vérifier le QR Code de présence
    const qrRecord = await QRCode.findOne({
      where: {
        valeur: qrValue,
        type: "PRESENCE",
        actif: true,
      },
    });

    if (!qrRecord) {
      return res.status(404).json({
        message: "QR Code de présence invalide ou inactif.",
      });
    }

    // 3. Vérifier l'expiration du QR
    if (
      qrRecord.dateExpiration &&
      new Date(qrRecord.dateExpiration) < new Date()
    ) {
      return res.status(400).json({
        message: "Le QR Code de présence a expiré.",
      });
    }

    // 4. Vérifier la position GPS
    // Exemple : coordonnées du siège
    const latitudeEntreprise = 3.848;
    const longitudeEntreprise = 11.5021;

    const distance = calculerDistance(
      latitude,
      longitude,
      latitudeEntreprise,
      longitudeEntreprise,
    );

    const rayonAutorise = 100; // 100 mètres

    if (distance > rayonAutorise) {
      return res.status(403).json({
        message: "Vous êtes hors de la zone autorisée.",
      });
    }

    // 5. Vérifier le Wi-Fi
    const wifiAutorise = "THEPUG_WIFI";

    if (wifiSsid !== wifiAutorise) {
      return res.status(403).json({
        message: "Vous n'êtes pas connecté au réseau Wi-Fi autorisé.",
      });
    }

    // 6. Récupérer le dernier pointage
    const dernierPointage = await MouvementPresence.findOne({
      where: {
        idUtilisateur,
      },
      order: [["dateHeure", "DESC"]],
    });

    // 7. Déterminer automatiquement ENTREE / SORTIE
    let type;

    if (!dernierPointage || dernierPointage.type === "SORTIE") {
      type = "ENTREE";
    } else {
      type = "SORTIE";
    }

    // 8. Enregistrer le mouvement
    const pointage = await MouvementPresence.create({
      idUtilisateur,
      idQRCode: qrRecord.idQRCode,
      type,
      justification: justification || null,
      dateHeure: new Date(),
    });

    // 9. Réponse
    return res.status(201).json({
      message: `Pointage ${type} enregistré avec succès.`,
      pointage,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

exports.getMonHistorique = async (req, res) => {
  console.info(`[presenceController.js] - getMonHistorique : en cours...`);
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const historique = await MouvementPresence.findAll({
      where: { idUtilisateur },
      order: [["dateHeure", "DESC"]],
    });
    res.json(historique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Consultation de l'historique de présence par utilisateur (Accessible uniquement aux administrateurs et responsables)
// futur amelioration : un responsable peut consulter l'historique de ses collaborateurs, mais pas celui des autres responsables.
exports.getHistoriqueParUtilisateur = async (req, res) => {
  console.info(`[presenceController.js] - getHistoriqueParUtilisateur : en cours...`);
  try {
    const { idUtilisateur } = req.params;
    const historique = await MouvementPresence.findAll({
      where: { idUtilisateur },
      order: [["dateHeure", "DESC"]],
    });
    res.json(historique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getAllHistorique = async (req, res) => {
  console.info(`[presenceController.js] - getAllHistorique : en cours...`);
  try {
    const { User } = require("../models");
    const historique = await MouvementPresence.findAll({
      include: [
        {
          model: User,
          as: "utilisateur",
          attributes: ["idUtilisateur", "nom", "prenom", "email"],
        },
      ],
      order: [["dateHeure", "DESC"]],
    });
    res.json(historique);
  } catch (error) {
    console.error(error);
    
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Enregistrer manuellement une présence ou absence pour un collaborateur
exports.enregistrerPointageManuel = async (req, res) => {
  console.info(`[presenceController.js] - enregistrerPointageManuel : en cours...`);
  try {
    const { idUtilisateur, type, justification } = req.body;

    if (!idUtilisateur) {
      return res.status(400).json({ message: "L'identifiant du collaborateur est requis." });
    }

    const { User } = require("../models");
    const targetUser = await User.findByPk(idUtilisateur);
    if (!targetUser) {
      return res.status(404).json({ message: "Collaborateur introuvable." });
    }

    const pointageType = type === 'SORTIE' ? 'SORTIE' : 'ENTREE';
    const justif = justification || (pointageType === 'ENTREE' 
      ? `Présence signalée par ${req.user.prenom || ''} ${req.user.nom || ''}`.trim()
      : `Absence signalée par ${req.user.prenom || ''} ${req.user.nom || ''}`.trim());

    const pointage = await MouvementPresence.create({
      idUtilisateur,
      idQRCode: 'MANUEL',
      type: pointageType,
      justification: justif,
      dateHeure: new Date(),
    });

    const { enregistrerActivite } = require('../services/auditService');
    await enregistrerActivite({
      idUtilisateur,
      action: pointageType === 'ENTREE' ? 'PRESENCE_MANUELLE' : 'ABSENCE_MANUELLE',
      description: pointageType === 'ENTREE' 
        ? `Présence validée par ${req.user.prenom || ''} ${req.user.nom || ''}`.trim()
        : `Absence signalée par ${req.user.prenom || ''} ${req.user.nom || ''}`.trim(),
      typeEntite: 'PRESENCE',
      idEntite: pointage.idMouvement,
    });

    res.status(201).json({
      message: `Pointage ${pointageType === 'ENTREE' ? 'de présence' : "d'absence"} enregistré avec succès.`,
      pointage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer le statut de présence du jour pour chaque collaborateur
exports.getCollaborateursStatus = async (req, res) => {
  try {
    const { User } = require("../models");
    const { Op } = require("sequelize");

    const users = await User.findAll({
      attributes: ['idUtilisateur', 'nom', 'prenom', 'email', 'avatarUri', 'poste', 'role', 'actif'],
      order: [['nom', 'ASC']],
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await Promise.all(
      users.map(async (u) => {
        const lastToday = await MouvementPresence.findOne({
          where: {
            idUtilisateur: u.idUtilisateur,
            dateHeure: {
              [Op.gte]: startOfDay,
            },
          },
          order: [['dateHeure', 'DESC']],
        });

        const isPresentToday = lastToday ? lastToday.type === 'ENTREE' : false;

        return {
          ...u.toJSON(),
          isPresentToday,
          lastPointageToday: lastToday,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
