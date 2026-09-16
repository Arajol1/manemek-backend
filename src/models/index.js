const sequelize = require('../config/database');
const User = require('./User');
const Mission = require('./Mission');
const Affectation = require('./Affectation');
const Equipement = require('./Equipement');
const QRCode = require('./Qrcode');

// Un Responsable (User avec rôle RESPONSABLE) peut créer 0..* Missions
User.hasMany(Mission, { foreignKey: 'responsableId', as: 'missionsCrees' });
Mission.belongsTo(User, { foreignKey: 'responsableId', as: 'responsable' });

// Relation N-N entre Collaborateur (User) et Mission à travers la classe Affectation (0..* <-> 0..*)
User.hasMany(Affectation, { foreignKey: 'collaborateurId', as: 'affectations' }); // declare qu'un user (collaborateur) peut etre affecté à plusieurs missions
Affectation.belongsTo(User, { foreignKey: 'collaborateurId', as: 'collaborateur' }); // declare qu'une affectation appartient à un user (collaborateur)

Mission.hasMany(Affectation, { foreignKey: 'missionId', as: 'affectations' });
Affectation.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });

// Relation 1-1 entre Equipement et QRCode
QRCode.hasOne(Equipement, { foreignKey: 'idQRCode', as: 'equipement' });
Equipement.belongsTo(QRCode, { foreignKey: 'idQRCode', as: 'qrCode' });


module.exports = {
  sequelize,
  User,
  Mission,
  Affectation,
  Equipement,
  QRCode
};