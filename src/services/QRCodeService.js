const QRCode = require("qrcode");
const crypto = require("crypto");
const QRCodeModel = require("../models/Qrcode");
const { Op } = require("sequelize");

exports.creerQRPresence = async () => {

  // Vérifier s'il existe déjà un QR pour aujourd'hui
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  const qrExistant = await QRCodeModel.findOne({
    where: {
      type: "PRESENCE",
      dateCreation: {
        [Op.between]: [debutJour, finJour]
      },
      actif: true
    }
  });

  if (qrExistant) {
    const qrImage = await QRCode.toDataURL(qrExistant.valeur);
    return {
      qr: qrExistant,
      qrImage
    };
  }

  // Générer une valeur aléatoire
  const valeur =
    `PRESENCE-${crypto.randomBytes(16).toString("hex")}`;

  // Date d'expiration : fin de journée
  const dateExpiration = new Date();
  dateExpiration.setHours(23, 59, 59, 999);

  // Créer l'enregistrement
  const qr = await QRCodeModel.create({
    valeur,
    type: "PRESENCE",
    dateExpiration,
    actif: true
  });

  // Générer l'image du QR
  const qrImage = await QRCode.toDataURL(valeur);

  return {
    qr,
    qrImage
  };
};