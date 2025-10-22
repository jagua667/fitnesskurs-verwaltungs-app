// compare_perf.js
const { performance } = require('perf_hooks');
const fs = require('fs');
const WebSocketContext = require('./src/websocket/WebSocketContext');
const mailer = require('./src/services/mailer');
const PerfMonitor = require('./src/utils/perfMonitor');

// Notifier-Implementierungen
const { notifyCourseDeletion: observerNotify, notifyCourseAvailableAgain: observerAvailable } =
  require('./src/services/notifications/observerNotifier');
const { createMediatorWithDefaults } =
  require('./src/services/notifications/mediatorNotifier');
const {
  publishCourseDeleted,
  publishCourseAvailableAgain
} = require('./src/services/notifications/pubsubNotifier');

(async () => {
  console.log('🏁 Starte Performancevergleich (Observer vs. Mediator vs. PubSub)...\n');

  // --- Setup: Mock WebSocket & Mailer ----------------------------
  const fakeIO = {
    to: () => ({ emit: () => {} }),
    emit: () => {}
  };
  WebSocketContext.getIO = () => fakeIO;
  mailer.sendMail = async () => {}; // deaktiviert echten Versand

  // --- Datenbasis ------------------------------------------------
  const users = Array.from({ length: 200 }, (_, i) => ({
    user_id: i + 1,
    email: `user${i + 1}@example.com`
  }));

  const courseDeletedMeta = { courseId: 101, message: 'Kurs abgesagt (Testlauf)' };
  const courseAvailableMeta = {
    id: 202,
    title: 'Zumba Intensiv',
    seatsAvailable: 2
  };

  // --- Performance-Helfer ---------------------------------------
  async function measure(label, fn, runs = 50) {
    const times = [];
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return {
      Pattern: label,
      'Avg (ms)': avg.toFixed(2),
      'Min (ms)': Math.min(...times).toFixed(2),
      'Max (ms)': Math.max(...times).toFixed(2)
    };
  }

  const mediator = createMediatorWithDefaults();

  // --- Testszenario 1: Kurs gelöscht -----------------------------
  const deletionResults = [];
  deletionResults.push(await measure('Observer', () =>
    observerNotify(users, courseDeletedMeta.courseId)
  ));
  deletionResults.push(await measure('Mediator', () =>
    mediator.notify(users, courseDeletedMeta)
  ));
  deletionResults.push(await measure('PubSub', () =>
    publishCourseDeleted(users, courseDeletedMeta.courseId)
  ));

  // --- Testszenario 2: Platz frei geworden -----------------------
  const availableResults = [];
  availableResults.push(await measure('Observer', () =>
    observerAvailable(users, courseAvailableMeta)
  ));
  availableResults.push(await measure('Mediator', () =>
    mediator.notify(users, {
      type: 'course:available',
      course: courseAvailableMeta
    })
  ));
  availableResults.push(await measure('PubSub', () =>
    publishCourseAvailableAgain(users, courseAvailableMeta)
  ));

  // --- Ausgabe ---------------------------------------------------
  console.log('\n📊 Ergebnisse: Kurs gelöscht');
  console.table(deletionResults);
  console.log('\n📊 Ergebnisse: Platz frei geworden');
  console.table(availableResults);

  // --- Markdown-Datei schreiben ---------------------------------
  const mdLines = [
    '# 📊 Performance-Vergleich der Notification-Patterns',
    '',
    '## 🧨 Kurs gelöscht',
    '',
    '| Pattern | Avg (ms) | Min (ms) | Max (ms) |',
    '|----------|----------|----------|----------|',
    ...deletionResults.map(r =>
      `| ${r.Pattern} | ${r['Avg (ms)']} | ${r['Min (ms)']} | ${r['Max (ms)']} |`
    ),
    '',
    '## 🔔 Platz frei geworden',
    '',
    '| Pattern | Avg (ms) | Min (ms) | Max (ms) |',
    '|----------|----------|----------|----------|',
    ...availableResults.map(r =>
      `| ${r.Pattern} | ${r['Avg (ms)']} | ${r['Min (ms)']} | ${r['Max (ms)']} |`
    ),
    '',
    `> Testlauf: ${new Date().toISOString()} – 50 Durchläufe, 200 User.`
  ];

  fs.mkdirSync('./perf_logs', { recursive: true });
  const outputPath = './perf_logs/perf_results.md';
  fs.writeFileSync(outputPath, mdLines.join('\n'), 'utf8');
  console.log(`\n📝 Ergebnisse gespeichert unter: ${outputPath}`);
  console.log('\n✅ Performancevergleich abgeschlossen.\n');
})();
