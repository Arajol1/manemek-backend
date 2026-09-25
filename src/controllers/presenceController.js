const { calculerDistance } = require("../utils/geoUtils");
const { MouvementPresence, QRCode } = require("../models");

exports.enregistrerPointage = async (req, res) => {
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
