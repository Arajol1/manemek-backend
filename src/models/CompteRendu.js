const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompteRendu = sequelize.define('CompteRendu', {
  idCompteRendu: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  idMission: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dateSoumission: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statut: {
    type: DataTypes.ENUM('BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE'),
    defaultValue: 'SOUMIS'
  },
  estValide: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: false });

module.exports = CompteRendu;