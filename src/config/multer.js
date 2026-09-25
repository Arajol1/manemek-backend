const multer = require('multer');
const path = require('path');

const fs = require('fs');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let folder = 'uploads/';

    if (file.fieldname === 'photo' || file.fieldname === 'photoProfil') {
      folder += 'profiles/';
    }

    if (file.fieldname === 'photoEquipement') {
      folder += 'equipements/';
    }

    if (file.fieldname === 'fichierJoint') {
      folder += 'incidents/';
    }

    if (file.fieldname === 'document') {
      folder += 'missions/';
    }

    // S'assurer que le dossier existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {

    const extension = path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;