const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MouvementEquipement = sequelize.define('MouvementEquipement', {
  idMouvement: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM('SORTIE', 'RETOUR', 'TRANSFERT'),
    allowNull: false
  },
  dateHeure: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  etatAvant: {
    type: DataTypes.ENUM('BON', 'USE', 'ENDOMMAGE', 'HORS_SERVICE'),
    allowNull: false
  },
  etatApres: {
    type: DataTypes.ENUM('BON', 'USE', 'ENDOMMAGE', 'HORS_SERVICE'),
    allowNull: false
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { timestamps: false });

module.exports = MouvementEquipement;