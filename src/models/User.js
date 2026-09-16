const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
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
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatarUri: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'RESPONSABLE', 'COLLABORATEUR'),
    allowNull: false,
    defaultValue: 'COLLABORATEUR'
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Champs spécifiques selon le rôle (Héritage UML traduit en colonne unique par simplification)
  niveauAcces: {
    type: DataTypes.STRING,
    allowNull: true // Pour Admin
  },
  departement: {
    type: DataTypes.STRING,
    allowNull: true // Pour Responsable
  },
  poste: {
    type: DataTypes.STRING,
    allowNull: true // Pour Collaborateur
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true // Pour Collaborateur
  }
}, {
  timestamps: true
});

module.exports = User;