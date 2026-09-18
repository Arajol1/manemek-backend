const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Affectation = sequelize.define('Affectation', {
  idAffectation: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dateAffectation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  collaborateurId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  missionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fonction: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('AFFECTEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'),
    defaultValue: 'AFFECTEE'
  }
}, {
  timestamps: true
});

module.exports = Affectation;