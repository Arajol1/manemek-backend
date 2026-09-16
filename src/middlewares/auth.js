const jwt = require('jsonwebtoken');

// 1. Vérifie si le token JWT est fourni et valide
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé : Jeton manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Jeton invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
};

// 2. Vérifie si l'utilisateur possède le rôle requis (ADMIN, RESPONSABLE, etc.)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permissions insuffisantes pour cette opération.' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };