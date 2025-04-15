
const nodemailer = require('nodemailer');

// Erstelle einen Transporter, um E-Mails zu versenden
const transporter = nodemailer.createTransport({
  service: 'gmail', // Hier kannst du auch einen anderen E-Mail-Dienst verwenden
  auth: {
    user: process.env.EMAIL_USER, // Deine E-Mail-Adresse, aus der die Mails versendet werden
    pass: process.env.EMAIL_PASS, // Dein Passwort oder App-Passwort (bei Gmail z.B.)
  },
});

// Funktion als Promise
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  // Versprechen zurückgeben
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Fehler beim Senden der E-Mail:', error);
        reject(error);
      } else {
        console.log('📧 E-Mail gesendet:', info.response);
        resolve(info);
      }
    });
  });
};


module.exports = { sendEmail }; 

