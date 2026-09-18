const QRCodeService = require('../services/QRCodeService');
// Génération du QR code de présence du jour
exports.getQRPresenceToday = async (req, res) => {
  try {

    const result = await QRCodeService.creerQRPresence();

    res.json({
      message: "QR de présence du jour",
      qr: result.qr,
      qrImage: result.qrImage
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la génération du QR.",
      error: error.message
    });
  }
};