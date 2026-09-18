const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mission = sequelize.define('Mission', {
  idMission: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codeMission: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  responsableId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dateFin: {
    type: DataTypes.DATE
  },
  statut: {
    type: DataTypes.ENUM('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'),
    defaultValue: 'PLANIFIEE'
  },
  priorite: {
    type: DataTypes.ENUM('BASSE', 'NORMALE', 'HAUTE', 'URGENTE'),
    defaultValue: 'NORMALE'
  },
  localisation: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Mission;