const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const envoyerCodeActivation = async (user, code) => {
  const codeDigits = code.toString().split('');

  await transporter.sendMail({
    from: `"Manemek" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Activation de votre compte Manemek',

    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Manemek</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #0F172A;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      ">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0F172A; padding: 40px 16px;">
          <tr>
            <td align="center">

              <!-- CARTE PRINCIPALE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                max-width: 520px;
                background-color: #1E293B;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
              ">

                <!-- BANDEAU DÉCORATIF HAUT -->
                <tr>
                  <td style="
                    background-color: #3B82F6;
                    padding: 32px 32px 28px 32px;
                    text-align: center;
                  ">
                    <h1 style="
                      margin: 0;
                      color: #FFFFFF;
                      font-size: 24px;
                      font-weight: 800;
                      letter-spacing: -0.5px;
                    ">
                      Bienvenue sur Manemek
                    </h1>
                    <p style="
                      margin: 8px 0 0 0;
                      color: rgba(255, 255, 255, 0.85);
                      font-size: 14px;
                      font-weight: 500;
                    ">
                      Activation de votre compte
                    </p>
                  </td>
                </tr>

                <!-- CONTENU -->
                <tr>
                  <td style="padding: 36px 32px 32px 32px;">

                    <!-- SALUTATION -->
                    <p style="
                      margin: 0 0 16px 0;
                      color: #F1F5F9;
                      font-size: 16px;
                      font-weight: 600;
                    ">
                      Bonjour ${user.prenom} ${user.nom},
                    </p>

                    <p style="
                      margin: 0 0 28px 0;
                      color: #94A3B8;
                      font-size: 14px;
                      line-height: 22px;
                    ">
                      Un compte Manemek a été créé pour vous par l'administrateur.
                      Utilisez le code ci-dessous pour activer votre compte et définir votre mot de passe.
                    </p>

                    <!-- ZONE DU CODE -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                      background-color: #0F172A;
                      border-radius: 16px;
                      margin-bottom: 24px;
                    ">
                      <tr>
                        <td align="center" style="padding: 28px 20px 20px 20px;">

                          <p style="
                            margin: 0 0 18px 0;
                            color: #64748B;
                            font-size: 11px;
                            font-weight: 800;
                            letter-spacing: 2px;
                            text-transform: uppercase;
                          ">
                            Votre code d'activation
                          </p>

                          <!-- CASES DU CODE -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              ${codeDigits.map(digit => `
                                <td style="padding: 0 4px;">
                                  <div style="
                                    width: 48px;
                                    height: 56px;
                                    background-color: #334155;
                                    border-radius: 10px;
                                    text-align: center;
                                    line-height: 56px;
                                    color: #FFFFFF;
                                    font-size: 28px;
                                    font-weight: 900;
                                    font-family: 'Courier New', monospace;
                                    letter-spacing: 1px;
                                  ">
                                    ${digit}
                                  </div>
                                </td>
                              `).join('')}
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- INFO VALIDITÉ -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                      background-color: rgba(59, 130, 246, 0.1);
                      border-radius: 8px;
                      margin-bottom: 24px;
                    ">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <p style="
                            margin: 0;
                            color: #93C5FD;
                            font-size: 13px;
                            font-weight: 600;
                            line-height: 20px;
                          ">
                          Ce code est valable pendant <strong style="color: #BFDBFE;">24 heures</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- INSTRUCTIONS -->
                    <p style="
                      margin: 0 0 28px 0;
                      color: #94A3B8;
                      font-size: 14px;
                      line-height: 22px;
                    ">
                      Saisissez ce code dans l'application Manemek afin d'activer votre compte et de créer votre mot de passe.
                    </p>

                    <!-- SÉPARATEUR -->
                    <div style="
                      height: 1px;
                      background-color: #334155;
                      margin: 28px 0;
                    "></div>

                    <!-- SIGNATURE -->
                    <p style="
                      margin: 0;
                      color: #94A3B8;
                      font-size: 14px;
                      line-height: 22px;
                    ">
                      Cordialement,<br>
                      <strong style="color: #F1F5F9;">L'équipe Manemek</strong>
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="
                    background-color: #0F172A;
                    padding: 20px 32px;
                    text-align: center;
                  ">
                    <p style="
                      margin: 0;
                      color: #64748B;
                      font-size: 11px;
                      line-height: 18px;
                    ">
                      Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
                      © ${new Date().getFullYear()} Manemek Operations — Tous droits réservés.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `
  });
};

module.exports = {
  envoyerCodeActivation
};