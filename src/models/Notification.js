const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  idNotification: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('MISSION', 'INCIDENT', 'EQUIPEMENT', 'PRESENCE', 'SYSTEME'),
    allowNull: false
  },
  dateEnvoi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estLue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: false });

module.exports = Notification;