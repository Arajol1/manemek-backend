const { Notification, User } = require('../models');

exports.MesNotifications = async (req, res) => {
  console.info(`[notificationController.js] - MesNotifications : en cours...`);
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const user = await User.findByPk(idUtilisateur);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const notifications = await Notification.findAll({
      where: { idUtilisateur },
      order: [['dateEnvoi', 'DESC']]
    });
    if(user.role === 'ADMIN' || user.role === 'RESPONSABLE'){
      const notificationsAdmin = await Notification.findAll({
        where: { idUtilisateur: null },
        order: [['dateEnvoi', 'DESC']]
      });

      res.json([...notifications, ...notificationsAdmin]);
    } else {
      res.json(notifications);
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.marquerCommeLue = async (req, res) => {
  console.info(`[notificationController.js] - marquerCommeLue : en cours...`);
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' });

    if (req.body && typeof req.body.estLue === 'boolean') {
      notif.estLue = req.body.estLue;
    } else {
      notif.estLue = !notif.estLue;
    }
    await notif.save();
    res.json({ message: 'Statut de la notification mis à jour.', estLue: notif.estLue, notif });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.toutMarquerCommeLue = async (req, res) => {
  console.info(`[notificationController.js] - toutMarquerCommeLue : en cours...`);
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const user = await User.findByPk(idUtilisateur);
    
    // Mark personal notifications as read
    await Notification.update({ estLue: true }, { where: { idUtilisateur, estLue: false } });

    // If admin/responsable, also mark global notifications as read
    if(user && (user.role === 'ADMIN' || user.role === 'RESPONSABLE')){
      await Notification.update({ estLue: true }, { where: { idUtilisateur: null, estLue: false } });
    }

    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.enregistrerFcmToken = async (req, res) => {
  console.info(`[notificationController.js] - enregistrerFcmToken : en cours...`);
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'Token FCM requis.' });
    }
    await User.update(
      { fcmToken },
      { where: { idUtilisateur: req.user.idUtilisateur } }
    );
    res.json({ message: 'Token FCM enregistré avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.testerNotification = async (req, res) => {
  console.info(`[notificationController.js] - testerNotification : en cours...`);
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const now = new Date();
    const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const notif = await Notification.create({
      titre: `🚀 Test Notification Web Push`,
      message: `Notification envoyée à ${heure} pour vérifier la réception en temps réel et l'affichage des alertes.`,
      type: 'INFO',
      estLue: false,
      dateEnvoi: now,
      idUtilisateur,
    });

    res.status(201).json({
      message: 'Notification de test générée avec succès.',
      notif,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};