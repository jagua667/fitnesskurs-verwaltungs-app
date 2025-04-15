// testNewMailer.js
require('dotenv').config();
const { sendBookingEmailToCustomer } = require('./src/services/mailer');

const testData = {
  name: 'Claudia',
  user: 'Claudia',
  course: 'Yoga Anfänger',
  date: '2025-04-17',
  time: '18:00',
  trainer: 'Anna Schmidt',
};

sendBookingEmailToCustomer('deine@email.de', testData)
  .then(() => console.log('✅ Test-Mail verschickt!'))
  .catch((err) => console.error('❌ Mail-Fehler:', err));

