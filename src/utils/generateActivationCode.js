const crypto = require('crypto');
// Génère un code d'activation aléatoire à 6 chiffres
const generateActivationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateActivationCode;