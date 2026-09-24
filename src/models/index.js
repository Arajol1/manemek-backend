const sequelize = require('../config/database');
const User = require('./User');
const Mission = require('./Mission');
const Affectation = require('./Affectation');
const Equipement = require('./Equipement');
const QRCode = require('./Qrcode');
const AnalyseIA = require('./AnalyseIA');
const CompteRendu = require('./CompteRendu');
const MouvementPresence = require('./MouvementPresence');
const Incident = require('./Incident');
const Notification = require('./Notification');
const MouvementEquipement = require('./MouvementEquipement');

// Un Responsable (User avec rôle RESPONSABLE) peut créer 0..* Missions
User.hasMany(Mission, { foreignKey: 'responsableId', as: 'missionsCrees' });
Mission.belongsTo(User, { foreignKey: 'responsableId', as: 'responsable' });

User.hasMany(Notification, { foreignKey: 'idUtilisateur', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'idUtilisateur', as: 'utilisateur' });

// Relation N-N entre Collaborateur (User) et Mission à travers la classe Affectation (0..* <-> 0..*)
User.hasMany(Affectation, { foreignKey: 'collaborateurId', as: 'affectations' }); // declare qu'un user (collaborateur) peut etre affecté à plusieurs missions
Affectation.belongsTo(User, { foreignKey: 'collaborateurId', as: 'collaborateur' }); // declare qu'une affectation appartient à un user (collaborateur)

Mission.hasMany(Affectation, { foreignKey: 'missionId', as: 'affectations' });
Affectation.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });

// Relation 1-1 entre Equipement et QRCode
QRCode.hasOne(Equipement, { foreignKey: 'idQRCode', as: 'equipement' });
Equipement.belongsTo(QRCode, { foreignKey: 'idQRCode', as: 'qrCode' });

// Relations MouvementEquipement
Equipement.hasMany(MouvementEquipement, { foreignKey: 'idEquipement' });
MouvementEquipement.belongsTo(Equipement, { foreignKey: 'idEquipement' });

User.hasMany(MouvementEquipement, { foreignKey: 'idUtilisateur' });
MouvementEquipement.belongsTo(User, { foreignKey: 'idUtilisateur' });

Mission.hasMany(MouvementEquipement, { foreignKey: 'idMission' });
MouvementEquipement.belongsTo(Mission, { foreignKey: 'idMission' });

// relation 1 - N  entre compte rendu et utilisateur
CompteRendu.belongsTo(User, { foreignKey: "idUtilisateur" });
User.hasMany(CompteRendu, {foreignKey: "idUtilisateur" });

// relation 1 - N entre compte rendu et mission
CompteRendu.belongsTo(Mission, { foreignKey: "idMission" });
Mission.hasMany(CompteRendu, { foreignKey: "idMission" });

// Relation 1 - N entre MouvementPresence et User
MouvementPresence.belongsTo(User, { foreignKey: 'idUtilisateur', as: 'utilisateur' });
User.hasMany(MouvementPresence, { foreignKey: 'idUtilisateur', as: 'presences' });

// Relation 1 - N entre Incident et User
Incident.belongsTo(User, { foreignKey: 'idUtilisateur', as: 'signaleur' });
User.hasMany(Incident, { foreignKey: 'idUtilisateur', as: 'incidentsSignales' });

module.exports = {
  sequelize,
  AnalyseIA,
  CompteRendu,
  MouvementPresence,
  MouvementEquipement,
  Notification,
  Incident,
  User,
  Mission,
  Affectation,
  Equipement,
  QRCode
};