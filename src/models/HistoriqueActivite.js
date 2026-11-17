const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriqueActivite = sequelize.define('HistoriqueActivite', {
  idHistorique: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  typeEntite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idEntite: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'HistoriqueActivites',
  timestamps: false,
});

module.exports = HistoriqueActivite;
