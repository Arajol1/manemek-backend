const { Equipement } = require('../models');

// 1. Créer un équipement
exports.createEquipement = async (req, res) => {
  console.info(`[equipementController.js] - createEquipement : en cours...`);
  try {
    const { nom, categorie, marque, modele, etat, quantite } = req.body;
    let photoUri = null;

    const codeEquipement = `EQP-${Date.now()}`;

    if (req.file) {
      photoUri = `/uploads/equipements/${req.file.filename}`;
    }

    const qte = Math.max(1, parseInt(quantite, 10) || 1);

    // Création de l'Équipement
    const equipement = await Equipement.create({
      codeEquipement,
      nom,
      categorie,
      marque,
      modele,
      etat: etat || 'BON',
      quantite: qte,
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

// 3. Récupérer la liste des catégories d'équipements prédéfinies
exports.getCategories = async (req, res) => {
  const categories = require('../constants/equipementCategories');
  res.json(categories);
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

// 5. Mettre à jour un équipement
exports.updateEquipement = async (req, res) => {
  console.info(`[equipementController.js] - updateEquipement : en cours...`);
  try {
    const { id } = req.params;
    const { nom, categorie, marque, modele, etat, quantite, disponible } = req.body;

    const equipement = await Equipement.findByPk(id);
    if (!equipement) {
      return res.status(404).json({ message: 'Équipement introuvable.' });
    }

    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (categorie !== undefined) updateData.categorie = categorie;
    if (marque !== undefined) updateData.marque = marque;
    if (modele !== undefined) updateData.modele = modele;
    if (etat !== undefined) updateData.etat = etat;
    if (quantite !== undefined) updateData.quantite = Math.max(1, parseInt(quantite, 10) || 1);
    if (disponible !== undefined) updateData.disponible = disponible;

    if (req.file) {
      updateData.photoUri = `/uploads/equipements/${req.file.filename}`;
    }

    await equipement.update(updateData);

    const { enregistrerActivite } = require('../services/auditService');
    await enregistrerActivite({
      idUtilisateur: req.user ? req.user.idUtilisateur : 1,
      action: 'MAJ_EQUIPEMENT',
      description: `Mise à jour équipement ${equipement.nom} (${equipement.codeEquipement}, Qté: ${equipement.quantite})`,
      typeEntite: 'EQUIPEMENT',
      idEntite: equipement.idEquipement,
    });

    res.json({
      message: 'Équipement mis à jour avec succès',
      equipement,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 6. Supprimer ou réduire la quantité d'un équipement
exports.deleteEquipement = async (req, res) => {
  console.info(`[equipementController.js] - deleteEquipement : en cours...`);
  try {
    const { id } = req.params;
    const quantiteASupprimer = parseInt(req.body?.quantite || req.query?.quantite || 0, 10);

    const equipement = await Equipement.findByPk(id);
    if (!equipement) {
      return res.status(404).json({ message: 'Équipement introuvable.' });
    }

    const { enregistrerActivite } = require('../services/auditService');

    // Si une quantité à supprimer est fournie et qu'elle est inférieure à la quantité actuelle
    if (quantiteASupprimer > 0 && quantiteASupprimer < equipement.quantite) {
      const nouvelleQuantite = equipement.quantite - quantiteASupprimer;
      await equipement.update({ quantite: nouvelleQuantite });

      await enregistrerActivite({
        idUtilisateur: req.user ? req.user.idUtilisateur : 1,
        action: 'SUPPRESSION_EQUIPEMENT_PARTIELLE',
        description: `Suppression de ${quantiteASupprimer} unité(s) de ${equipement.nom} (Reste: ${nouvelleQuantite})`,
        typeEntite: 'EQUIPEMENT',
        idEntite: equipement.idEquipement,
      });

      return res.json({
        message: `${quantiteASupprimer} unité(s) supprimée(s). Reste : ${nouvelleQuantite}.`,
        equipement,
        deletedCompletely: false,
      });
    }

    // Sinon, suppression complète
    const nom = equipement.nom;
    const code = equipement.codeEquipement;

    // Dissocier les enregistrements liés pour éviter les erreurs de clés étrangères
    const { MouvementEquipement, Incident } = require('../models');
    try {
      await MouvementEquipement.destroy({ where: { idEquipement: id } });
      await Incident.update({ idEquipement: null }, { where: { idEquipement: id } });
    } catch (e) {
      console.warn("Nettoyage des relations avant suppression :", e.message);
    }

    await equipement.destroy();

    await enregistrerActivite({
      idUtilisateur: req.user ? req.user.idUtilisateur : 1,
      action: 'SUPPRESSION_EQUIPEMENT',
      description: `Suppression totale de l'équipement ${nom} (${code})`,
      typeEntite: 'EQUIPEMENT',
      idEntite: id,
    });

    res.json({
      message: 'Équipement supprimé avec succès.',
      deletedCompletely: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 7. Dégrader / Reclasser une quantité d'équipements vers un autre état
exports.reclasserEquipement = async (req, res) => {
  console.info(`[equipementController.js] - reclasserEquipement : en cours...`);
  try {
    const { id } = req.params;
    const { nouvelEtat } = req.body;
    const quantiteAReclasser = parseInt(req.body.quantite, 10);

    const etatsValides = ['BON', 'USE', 'ENDOMMAGE', 'HORS_SERVICE'];
    if (!etatsValides.includes(nouvelEtat)) {
      return res.status(400).json({ message: `État invalide. Valeurs permises: ${etatsValides.join(', ')}` });
    }

    const equipement = await Equipement.findByPk(id);
    if (!equipement) {
      return res.status(404).json({ message: 'Équipement source introuvable.' });
    }

    if (equipement.etat === nouvelEtat) {
      return res.status(400).json({ message: `L'équipement est déjà à l'état ${nouvelEtat}.` });
    }

    if (!quantiteAReclasser || quantiteAReclasser <= 0 || quantiteAReclasser > equipement.quantite) {
      return res.status(400).json({ message: `Quantité invalide (doit être entre 1 et ${equipement.quantite}).` });
    }

    const { enregistrerActivite } = require('../services/auditService');
    const etatPrecedent = equipement.etat;

    // Rechercher s'il existe déjà un lot pour cet équipement (même nom, marque, catégorie) ayant déjà le nouvelEtat
    let lotCible = await Equipement.findOne({
      where: {
        nom: equipement.nom,
        categorie: equipement.categorie,
        etat: nouvelEtat,
      }
    });

    if (quantiteAReclasser === equipement.quantite) {
      // Tout le lot change d'état
      if (lotCible && lotCible.idEquipement !== equipement.idEquipement) {
        // Fusionner avec le lot cible existant
        await lotCible.update({ quantite: lotCible.quantite + quantiteAReclasser });
        
        // Dissocier les relations avant suppression
        const { MouvementEquipement, Incident } = require('../models');
        try {
          await MouvementEquipement.destroy({ where: { idEquipement: equipement.idEquipement } });
          await Incident.update({ idEquipement: null }, { where: { idEquipement: equipement.idEquipement } });
        } catch (e) {
          console.warn(e);
        }
        await equipement.destroy();
      } else {
        // Mettre simplement à jour l'état de ce lot
        await equipement.update({ 
          etat: nouvelEtat,
          disponible: nouvelEtat !== 'HORS_SERVICE'
        });
        lotCible = equipement;
      }
    } else {
      // Reclassification partielle
      const resteSource = equipement.quantite - quantiteAReclasser;
      await equipement.update({ quantite: resteSource });

      if (lotCible) {
        // Incrémenter le lot cible existant
        await lotCible.update({ quantite: lotCible.quantite + quantiteAReclasser });
      } else {
        // Créer un nouveau lot pour le nouvel état
        const nouveauCode = `EQP-${Date.now()}`;
        lotCible = await Equipement.create({
          codeEquipement: nouveauCode,
          nom: equipement.nom,
          categorie: equipement.categorie,
          marque: equipement.marque,
          modele: equipement.modele,
          photoUri: equipement.photoUri,
          etat: nouvelEtat,
          quantite: quantiteAReclasser,
          disponible: nouvelEtat !== 'HORS_SERVICE'
        });
      }
    }

    await enregistrerActivite({
      idUtilisateur: req.user ? req.user.idUtilisateur : 1,
      action: 'RECLASSIFICATION_EQUIPEMENT',
      description: `Reclassification de ${quantiteAReclasser} unité(s) de ${equipement.nom} de ${etatPrecedent} vers ${nouvelEtat}`,
      typeEntite: 'EQUIPEMENT',
      idEntite: equipement.idEquipement,
    });

    res.json({
      message: `Reclassification réussie : ${quantiteAReclasser} unité(s) passée(s) à l'état ${nouvelEtat}.`,
      lotSource: equipement,
      lotCible
    });
  } catch (error) {
    console.error('Erreur reclassification:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
