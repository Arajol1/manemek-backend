// src/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  idUtilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },

  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: true
  },

  avatarUri: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM(
      'ADMIN',
      'RESPONSABLE',
      'COLLABORATEUR'
    ),
    allowNull: false,
    defaultValue: 'COLLABORATEUR'
  },

  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  codeActivation: {
    type: DataTypes.STRING,
    allowNull: true
  },

  expirationCodeActivation: {
    type: DataTypes.DATE,
    allowNull: true
  },

  niveauAcces: {
    type: DataTypes.STRING,
    allowNull: true
  },

  departement: {
    type: DataTypes.STRING,
    allowNull: true
  },

  poste: {
    type: DataTypes.STRING,
    allowNull: true
  },

  telephone: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  timestamps: true
});

module.exports = User;