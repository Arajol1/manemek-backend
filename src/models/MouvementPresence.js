const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MouvementPresence = sequelize.define('MouvementPresence', {
  idMouvement: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idQRCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ENTREE', 'SORTIE'),
    allowNull: false
  },
  dateHeure: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  justification: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = MouvementPresence;