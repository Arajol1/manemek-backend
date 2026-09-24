const { Equipement, QRCode: QRCodeModel } = require('../models');
const QRCodeGenerator = require('qrcode');

// 1. Créer un équipement et son QRCode lié (selon le diagramme)
exports.createEquipement = async (req, res) => {
  try {
    const { nom, categorie, marque, modele, etat } = req.body;
    let photoUri = null;

    const codeEquipement = `EQP-${Date.now()}`;
    const qrValue = `MANEMEK-EQP:${codeEquipement}`;

    // Création du QR Code en BDD (Entité QRCode du diagramme)
    const newQRCode = await QRCodeModel.create({
      valeur: qrValue,
      type: 'EQUIPEMENT',
      actif: true
    });
    if (req.file) {
      photoUri = `/uploads/equipements/${req.file.filename}`;
    }
    // Création de l'Équipement lié
    const equipement = await Equipement.create({
      codeEquipement,
      nom,
      categorie,
      marque,
      modele,
      etat: etat || 'BON',
      disponible: true,
      photoUri,
      idQRCode: newQRCode.idQRCode
    });

    // Génération du rendu d'image Base64 pour le mobile/web
    const qrImageBase64 = await QRCodeGenerator.toDataURL(qrValue);

    res.status(201).json({
      message: 'Équipement et QR Code créés avec succès',
      equipement,
      qrCode: newQRCode,
      qrImageBase64
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 2. Scanner / Récupérer par QR Code (Utilisé par scannerQRCode du Collaborateur)
exports.getEquipementByQR = async (req, res) => {
  try {
    const { qrValue } = req.params;

    const qrRecord = await QRCodeModel.findOne({
      where: { valeur: qrValue, actif: true }
    });

    if (!qrRecord) {
      return res.status(404).json({ message: 'QR Code invalide ou inactif.' });
    }

    const equipement = await Equipement.findOne({
      where: { idQRCode: qrRecord.idQRCode }
    });

    if (!equipement) {
      return res.status(404).json({ message: 'Aucun équipement associé à ce QR Code.' });
    }

    res.json({ equipement, qrCode: qrRecord });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};