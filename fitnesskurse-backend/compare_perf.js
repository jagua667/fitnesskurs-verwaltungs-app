// compare_perf.js
const { performance } = require('perf_hooks');
const { notifyCourseDeletion: observerNotify } = require('./src/services/notifications/observerNotifier');
const { createMediatorWithDefaults } = require('./src/services/notifications/mediatorNotifier');
const { publishCourseDeleted } = require('./src/services/notifications/pubsubNotifier');
const WebSocketContext = require('./src/websocket/WebSocketContext');
const mailer = require('./src/services/mailer');
const PerfMonitor = require('./src/utils/perfMonitor');

(async () => {
  console.log('🏁 Starte Performancevergleich (Observer vs. Mediator vs. PubSub)...\n');

// --- Mock: Fake WebSocket + Mailer ------------------------
const fakeIO = {
  to: (room) => ({
    emit: (event, payload) => {
      // Optional: loggen oder zählen
      // console.debug(`[MockIO] emit -> ${room}`, event);
    }
  }),
  emit: (event, payload) => {
    // Root emit (falls direkt aufgerufen)
  }
};

WebSocketContext.getIO = () => fakeIO;
mailer.sendMail = async () => {}; // Dummy-Mailer


  // --- Mock Users -------------------------------------------
  const affectedUsers = Array.from({ length: 100 }, (_, i) => ({
    user_id: i + 1,
    email: `user${i + 1}@example.com`
  }));

  // --- Helper: Measure Async Duration -----------------------
  async function measure(label, fn, runs = 50) {
    const times = [];
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    return { label, avg, min, max };
  }

  // --- Prepare Mediator Instance ----------------------------
  const mediator = createMediatorWithDefaults();

  // --- Measure Each Pattern ---------------------------------
  const results = [];

  results.push(await measure('Observer', async () => {
    await observerNotify(affectedUsers, 101);
  }));

  results.push(await measure('Mediator', async () => {
    await mediator.notify(affectedUsers, {
      courseId: 202,
      message: 'Kurs abgesagt (Testlauf)'
    });
  }));

  results.push(await measure('PubSub', async () => {
    await publishCourseDeleted(affectedUsers, 303);
  }));

  // --- Ausgabe ----------------------------------------------
  console.log('\n📊 Vergleichsergebnisse (50 Durchläufe, 100 User):\n');
  console.table(results.map(r => ({
    Pattern: r.label,
    'Avg (ms)': r.avg.toFixed(2),
    'Min (ms)': r.min.toFixed(2),
    'Max (ms)': r.max.toFixed(2)
  })));

// --- Schreibe Markdown-Ergebnisdatei ----------------------
const fs = require('fs');
const mdLines = [
  '# 📊 Performance-Vergleich der Notification-Patterns',
  '',
  '| Pattern | Avg (ms) | Min (ms) | Max (ms) |',
  '|----------|----------|----------|----------|',
  ...results.map(r => 
    `| ${r.label} | ${r.avg.toFixed(2)} | ${r.min.toFixed(2)} | ${r.max.toFixed(2)} |`
  ),
  '',
  `> Testlauf: ${new Date().toISOString()} – 50 Durchläufe, 100 User.`
];

const outputPath = './perf_logs/perf_results.md';
fs.writeFileSync(`${outputPath}`, mdLines.join('\n'), 'utf8');
console.log(`📝 Ergebnisse gespeichert unter: ${outputPath}`);

  console.log('\n✅ Test abgeschlossen. Werte werden im PerfMonitor-Log zusätzlich aufgezeichnet.\n');
})();

// --- Jest-like Mock Helper ----------------------------------
function jestLikeMockFn() {
  const fn = (...args) => {
    fn.calls.push(args);
    return fn._returnThis ? fn : undefined;
  };
  fn.calls = [];
  fn.returnsThis = () => {
    fn._returnThis = true;
    return fn;
  };
  return fn;
}
