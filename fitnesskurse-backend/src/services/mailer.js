// src/services/mailer.js

/**
 * Service zum Versenden von E-Mails mit nodemailer.
 * 
 * Konfiguration:
 * - Verwendet Gmail als SMTP-Service.
 * - SMTP-Zugangsdaten über Umgebungsvariablen EMAIL_USER und EMAIL_PASS.
 * 
 * Funktionen:
 * - sendEmail(to, subject, text): Senden einer einfachen E-Mail.
 * - Spezialisierte Funktionen für Buchungs- und Stornierungs-Mails an Kunden und Trainer.
 * 
 * Beispielaufruf (automatisch beim Laden des Moduls):
 * sendEmail('deine.email@example.com', 'Testmail', 'Das ist ein Test aus meiner App');
 * 
 * Formatierte Mailtexte:
 * - Buchungsbestätigung für Kunde und Trainer.
 * - Stornierungsbestätigung für Kunde und Trainer.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: `"Fitnesskurse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ E-Mail-Fehler:', error);
  }
};


// Test-Mail (optional, wird beim Laden des Moduls gesendet)
const testEmail = 'claudia.niederhofer1804@gmail.com';  // Deine eigene Gmail-Adresse
sendEmail(testEmail, 'Testmail', 'Das ist ein Test aus meiner App');


// Vorlagen für E-Mail-Texte
const formatBookingText = (data) => (
  `Hallo ${data.name},\n\n` +
  `Du hast den Kurs "${data.course}" am ${data.date} um ${data.time} Uhr mit Trainer ${data.trainer} erfolgreich gebucht.\n\n` +
  `Sportliche Grüße,\nDein Fitness-Team`
);

const formatTrainerBookingText = (data) => (
  `Trainer-Info:\n\n` +
  `${data.user} hat sich für deinen Kurs "${data.course}" am ${data.date} um ${data.time} Uhr angemeldet.`
);

const formatCancellationText = (data) => (
  `Hallo ${data.name},\n\n` +
  `Du hast deine Buchung für den Kurs "${data.course}" am ${data.date} um ${data.time} Uhr storniert.\n\n` +
  `Sportliche Grüße,\nDein Fitness-Team`
);

const formatTrainerCancellationText = (data) => (
  `Trainer-Info:\n\n` +
  `${data.user} hat den Kurs "${data.course}" am ${data.date} um ${data.time} Uhr abgesagt.`
);


// Exportierte Funktionen für andere Module
module.exports = {
  sendBookingEmailToCustomer: (to, data) =>
    sendEmail(to, 'Buchungsbestätigung', formatBookingText(data)),

  sendBookingEmailToTrainer: (to, data) =>
    sendEmail(to, 'Neue Buchung für deinen Kurs', formatTrainerBookingText(data)),

  sendCancellationEmailToCustomer: (to, data) =>
    sendEmail(to, 'Stornierungsbestätigung', formatCancellationText(data)),

  sendCancellationEmailToTrainer: (to, data) =>
    sendEmail(to, 'Stornierung deines Kurses', formatTrainerCancellationText(data)),
};

