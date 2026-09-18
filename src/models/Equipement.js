const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipement = sequelize.define('Equipement', {
  idEquipement: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  codeEquipement: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  idQRCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marque: {
    type: DataTypes.STRING
  },
  modele: {
    type: DataTypes.STRING
  },
  photoUri: {
    type: DataTypes.STRING,
    allowNull: true
  },
  etat: {
    type: DataTypes.ENUM('BON', 'USE', 'ENDOMMAGE', 'HORS_SERVICE'),
    defaultValue: 'BON'
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: false
});

module.exports = Equipement;