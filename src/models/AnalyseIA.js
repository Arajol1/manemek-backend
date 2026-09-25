const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyseIA = sequelize.define('AnalyseIA', {
  idAnalyse: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM('PERFORMANCE', 'PRESENCES', 'MISSIONS', 'INCIDENTS', 'MATERIEL', 'COMPTES_RENDUS'),
    allowNull: false
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dateGeneration: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  periodeDebut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  periodeFin: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, { timestamps: false });

module.exports = AnalyseIA;