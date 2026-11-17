const { Equipement } = require('../models');

// 1. Créer un équipement
exports.createEquipement = async (req, res) => {
  console.info(`[equipementController.js] - createEquipement : en cours...`);
  try {
    const { nom, categorie, marque, modele, etat } = req.body;
    let photoUri = null;

    const codeEquipement = `EQP-${Date.now()}`;

    if (req.file) {
      photoUri = `/uploads/equipements/${req.file.filename}`;
    }

    // Création de l'Équipement
    const equipement = await Equipement.create({
      codeEquipement,
      nom,
      categorie,
      marque,
      modele,
      etat: etat || 'BON',
      disponible: true,
      photoUri
    });

    res.status(201).json({
      message: 'Équipement créé avec succès',
      equipement
    });
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 2. Récupérer tous les équipements (Utilisé par le Dashboard Admin)
exports.getAllEquipements = async (req, res) => {
  console.info(`[equipementController.js] - getAllEquipements : en cours...`);
  try {
    const equipements = await Equipement.findAll({
      order: [['codeEquipement', 'DESC']]
    });
    res.json(equipements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 4. Récupérer un équipement par son ID
exports.getEquipementById = async (req, res) => {
  console.info(`[equipementController.js] - getEquipementById : en cours...`);
  try {
    const { id } = req.params;
    const equipement = await Equipement.findByPk(id);
    
    if (!equipement) {
      return res.status(404).json({ message: 'Équipement introuvable.' });
    }
    
    res.json(equipement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};