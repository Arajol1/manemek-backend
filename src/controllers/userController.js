// src/controllers/userController.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateActivationCode = require('../utils/generateActivationCode');
const {
  envoyerCodeActivation
} = require('../services/emailService');

// connexion d'un utilisateur

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    if (!user.actif || !user.password) {
      return res.status(403).json({
        message: 'Compte non activé. Veuillez utiliser le code reçu par email.'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Mot de passe incorrect.'
      });
    }

    const token = jwt.sign(
      {
        idUtilisateur: user.idUtilisateur,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    res.json({
      message: 'Connexion réussie',

      token,

      user: {
        idUtilisateur: user.idUtilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUri: user.avatarUri
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};



// profile de l'utilisateur connecté


exports.getMe = async (req, res) => {
  try {

    const user = await User.findByPk(
      req.user.idUtilisateur,
      {
        attributes: {
          exclude: [
            'password',
            'codeActivation',
            'expirationCodeActivation'
          ]
        }
      }
    );

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// cree un utilisateur(admin uniquement) et envoie le code d'activation par email

exports.createUser = async (req, res) => {
  try {

    const {
      nom,
      prenom,
      email,
      role,
      poste,
      telephone,
      departement,
      niveauAcces
    } = req.body;

    
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Cet email est déjà utilisé.'
      });
    }

    const codeActivation = generateActivationCode();

    const expirationCodeActivation = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const newUser = await User.create({

      nom,
      prenom,
      email,

      password: null,

      role,

      poste,
      telephone,
      departement,
      niveauAcces,

      actif: false,

      codeActivation,
      expirationCodeActivation
    });

    try {

      await envoyerCodeActivation(
        newUser,
        codeActivation
      );

    } catch (emailError) {

      await newUser.destroy();

      console.error(
        'Erreur envoi email :',
        emailError
      );

      return res.status(500).json({
        message: 'Utilisateur non créé : impossible d’envoyer l’email.'
      });
    }

    res.status(201).json({

      message:
        'Utilisateur créé. Le code d’activation a été envoyé par email.',

      user: {
        idUtilisateur: newUser.idUtilisateur,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: newUser.role,
        actif: newUser.actif
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


// activation du compte utilisateur avec le code reçu par email et définition du mot de passe

exports.activateAccount = async (req, res) => {
  try {

    const {
      email,
      code,
      password
    } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        message:
          'Email, code et mot de passe sont obligatoires.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Le mot de passe doit contenir au moins 8 caractères.'
      });
    }

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    if (user.actif) {
      return res.status(400).json({
        message: 'Ce compte est déjà activé.'
      });
    }

    if (!user.codeActivation) {
      return res.status(400).json({
        message: 'Aucun code d’activation valide.'
      });
    }

    if (user.codeActivation !== code) {
      return res.status(400).json({
        message: 'Code d’activation incorrect.'
      });
    }

    if (
      !user.expirationCodeActivation ||
      new Date() >
        new Date(user.expirationCodeActivation)
    ) {
      return res.status(400).json({
        message: 'Le code d’activation a expiré.'
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await user.update({

      password: hashedPassword,

      actif: true,

      codeActivation: null,

      expirationCodeActivation: null
    });

    res.json({

      message:
        'Compte activé avec succès. Vous pouvez maintenant vous connecter.'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


// renvoyer un nouveau code d'activation si l'utilisateur ne l'a pas reçu ou s'il a expiré

exports.resendActivationCode = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    if (user.actif) {
      return res.status(400).json({
        message: 'Ce compte est déjà activé.'
      });
    }

    const codeActivation = generateActivationCode();

    const expirationCodeActivation = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.update({
      codeActivation,
      expirationCodeActivation
    });

    try {

      await envoyerCodeActivation(
        user,
        codeActivation
      );

    } catch (emailError) {

      console.error(emailError);

      return res.status(500).json({
        message: 'Impossible d’envoyer le nouvel email.'
      });
    }

    res.json({
      message:
        'Un nouveau code d’activation a été envoyé.'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


// obtenir la liste de tous les utilisateurs (admin uniquement)

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.findAll({

      attributes: {
        exclude: [
          'password',
          'codeActivation',
          'expirationCodeActivation'
        ]
      }

    });

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


//modifier les informations d'un utilisateur (admin uniquement)

exports.updateUser = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      nom,
      prenom,
      email,
      password,
      role,
      poste,
      telephone,
      departement,
      niveauAcces,
      actif
    } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    if (email && email !== user.email) {

      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Cet email est déjà utilisé.'
        });
      }
    }

    const updateData = {
      nom,
      prenom,
      email,
      role,
      poste,
      telephone,
      departement,
      niveauAcces
    };

    if (typeof actif === 'boolean') {
      updateData.actif = actif;
    }

    if (password) {

      updateData.password =
        await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.json({

      message:
        'Utilisateur mis à jour avec succès',

      user: {
        idUtilisateur: user.idUtilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        actif: user.actif
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


//supprimer un utilisateur (admin uniquement)

exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    await user.destroy();

    res.json({
      message: 'Utilisateur supprimé avec succès.'
    });

  } catch (error) {

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// src/controllers/userController.js

exports.updateMe = async (req, res) => {
  try {
    const { email, telephone } = req.body;

    const user = await User.findByPk(req.user.idUtilisateur);

    if (!user) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        message: 'Utilisateur introuvable.',
      });
    }

    const updateData = {};

    // ─── MISE À JOUR DE L'EMAIL ───
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: 'Cet email est déjà utilisé.',
        });
      }
      updateData.email = email;
    }

    // ─── MISE À JOUR DU TÉLÉPHONE ───
    if (telephone && telephone !== user.telephone) {
      updateData.telephone = telephone;
    }

    // ─── MISE À JOUR DE L'AVATAR ───
    if (req.file) {
      // supprimer l'ancien avatar local s'il existe
      if (user.avatarUri && user.avatarUri.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.avatarUri);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.avatarUri = `/uploads/profiles/${req.file.filename}`;
    }

    // ─── AUCUNE MODIFICATION ───
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'Aucune information à mettre à jour.',
      });
    }

    await user.update(updateData);

    res.json({
      message: 'Profil mis à jour avec succès.',
      user: {
        idUtilisateur: user.idUtilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        avatarUri: user.avatarUri,
      },
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};