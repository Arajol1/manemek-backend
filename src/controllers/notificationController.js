const { Notification, User } = require('../models');

exports.MesNotifications = async (req, res) => {
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
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' });

    notif.estLue = true;
    await notif.save();
    res.json({ message: 'Notification marquée comme lue.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};