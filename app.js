require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');
const userRoutes = require('./src/routes/userRoutes');
const equipementRoutes = require('./src/routes/equipementRoutes');
const missionRoutes = require('./src/routes/missionRoutes');

const app = express();

// Middlewares de sécurité et d'analyse des requêtes
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enregistrement des routes
app.get('/', (req, res) => {
  res.json({ message: 'API Manemek opérationnelle' });
});
app.use('/api', userRoutes);
//mission routes
app.use('/api/missions', missionRoutes);
// equipements routes
app.use('/api/equipements', equipementRoutes);



// Connexion à la base de données et démarrage du serveur
const PORT = process.env.PORT || 5000;

async function startServer() {
try {
    await sequelize.authenticate();
    console.log('✅ Base de données SQLite connectée avec succès.');

    await sequelize.sync();

    // Création automatique de l'Admin par défaut si aucun utilisateur n'existe
    const userCount = await User.count();
    if (userCount === 0) {
      const defaultPassword = await bcrypt.hash('Admin123!', 10);
      await User.create({
        nom: 'System',
        prenom: 'Admin',
        email: 'admin@manemek.com',
        password: defaultPassword,
        role: 'ADMIN',
        niveauAcces: 'SUPER_ADMIN'
      });
      console.log('👤 Compte Administrateur initial créé : admin@manemek.com / Admin123!');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error);
  }
}

startServer();