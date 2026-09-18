const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incident = sequelize.define('Incident', {
  idIncident: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
    idEquipement: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4
  },
    idMission: {
    type: DataTypes.INTEGER,
  },
    idUtilisateur: {
    type: DataTypes.INTEGER,
  },
  sujet: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categorie: {
    type: DataTypes.ENUM('MISSION', 'MATERIEL'),
    allowNull: false,
    defaultValue:''
  },
  niveauUrgence: {
    type: DataTypes.ENUM('FAIBLE', 'MOYENNE', 'IMPORTANTE', 'CRITIQUE'),
    defaultValue: 'MOYENNE'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dateSignalement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statutResolution: {
    type: DataTypes.ENUM('OUVERT', 'EN_COURS', 'RESOLU', 'FERME'),
    defaultValue: 'OUVERT'
  },
fichierJoint: {
  type: DataTypes.TEXT, // Utilise TEXT pour avoir assez de place pour plusieurs liens
  allowNull: true,
  defaultValue: '[]',
  get() {
      const rawValue = this.getDataValue('fichierJoint');
    return rawValue ? JSON.parse(rawValue) : []; // Convertit le texte SQL en tableau JS
  },
  set(value) {
      this.setDataValue('fichierJoint', JSON.stringify(value)); // Convertit le tableau JS en texte SQL
  }
}

}, { timestamps: false });

module.exports = Incident;