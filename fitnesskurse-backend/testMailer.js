require('dotenv').config();
const { sendEmail } = require('./src/services/mailer');

sendEmail('claudia.niederhofer1804@gmail.com', 'Test-Mail von Fitnesskurs-App', '🎉 E-Mail funktioniert!')
  .then(() => console.log('✅ Test-Mail gesendet!'))
  .catch(err => console.error('❌ Fehler beim Senden der Mail:', err));

