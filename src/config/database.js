const { Sequelize } = require('sequelize');
const path = require('path');

// Initialisation de la connexion SQLite via Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false // Désactive les logs SQL verbeux dans la console
});

module.exports = sequelize;