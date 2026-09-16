const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QRCodeModel = sequelize.define('QRCode', {
  idQRCode: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  valeur: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('EQUIPEMENT', 'PRESENCE'),
    allowNull: false
  },
  dateCreation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dateExpiration: {
    type: DataTypes.DATE
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: false
});

module.exports = QRCodeModel;