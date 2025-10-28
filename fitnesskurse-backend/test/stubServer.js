/**
 * 🧪 Stub-Server zum Testen der Benachrichtigungs-Algorithmen (Observer | Mediator | PubSub)
 * Läuft unabhängig von DB, Mailer oder WebSocket und reagiert auf die API-Endpunkte aus den Artillery-YAMLs.
 */
const express = require('express');
const app = express();
app.use(express.json());

/**
 * Simuliert zufällige Latenzzeiten, um realistischere Messungen zu ermöglichen.
 * Beispiel: 5–25 ms Verzögerung
 */
function fakeLatency() {
  const delay = 5 + Math.random() * 20;
  return new Promise((r) => setTimeout(r, delay));
}

/**
 * Einfache Healthcheck-Route für Smoke-Tests. Nur für den Stub-Server, nicht für den produktiven Server
 * ➜ GET http://localhost:5000/api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 🔹 Buchung stornieren
 * Wird durch Artillery-Datei "artillery-cancel-booking-notifications.yml" getestet.
 * Beispiel: DELETE /api/bookings/42?pattern=mediator
 */
app.delete('/api/bookings/:bookingId', async (req, res) => {
  await fakeLatency();
  const pattern = (req.query.pattern || 'observer').toLowerCase();
  const id = Number(req.params.bookingId);
  console.log(`[Stub] cancelBooking → bookingId=${id}, pattern=${pattern}`);
  res.json({
    ok: true,
    type: 'cancelBooking',
    pattern,
    bookingId: id,
    simulatedDelayMs: Math.round(Math.random() * 25),
  });
});

/**
 * 🔹 Kurs löschen
 * Wird durch Artillery-Datei "artillery-delete-course-notifications.yml" getestet.
 * Beispiel: DELETE /api/courses/17?pattern=pubsub
 */
app.delete('/api/courses/:courseId', async (req, res) => {
  await fakeLatency();
  const pattern = (req.query.pattern || 'observer').toLowerCase();
  const id = Number(req.params.courseId);
  console.log(`[Stub] deleteCourse → courseId=${id}, pattern=${pattern}`);
  res.json({
    ok: true,
    type: 'deleteCourse',
    pattern,
    courseId: id,
    simulatedDelayMs: Math.round(Math.random() * 25),
  });
});

/**
 * 🔹 Optional: alte Legacy-Route (nur falls noch in YAML-Dateien referenziert)
 */
// app.delete('/api/courses/:courseId/pattern', async (req, res) => {
//   await fakeLatency();
//   const pattern = (req.query.pattern || 'observer').toLowerCase();
//   console.log(`[Stub] deleteCourse (legacy) → id=${req.params.courseId}, pattern=${pattern}`);
//   res.json({ ok: true, pattern, legacy: true, courseId: Number(req.params.courseId) });
// });

/**
 * Serverstart
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🧪 Stub-Server running at: http://localhost:${PORT}`);
  console.log('   → Ready for Artillery load tests');
});

module.exports = app;
