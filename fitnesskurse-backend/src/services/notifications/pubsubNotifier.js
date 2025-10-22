// src/services/notifications/pubsubNotifier.js
const EventEmitter = require('events');
const WebSocketContext = require('../../websocket/WebSocketContext');
const mailer = require('../mailer');
const PerfMonitor = require('../../utils/perfMonitor');

const bus = new EventEmitter();

// 🧩 Kurs gelöscht: WebSocket + Mail
bus.on('courseDeleted', async (payload) => {
  return PerfMonitor.measureAsync('PubSub.notifyCourseDeletion', async () => {
    const { affectedUsers, courseId } = payload;
    const io = WebSocketContext.getIO ? WebSocketContext.getIO() : (WebSocketContext.io || null);
    if (!io) return;
    const notification = { type: 'course:deleted', courseId, message: 'Kurs abgesagt' };
    affectedUsers.forEach(u => {
      try { io.to(`user_${u.user_id}`).emit('notification', notification); } catch (e) { console.error(e); }
    });
  });
});

bus.on('courseDeleted', async (payload) => {
  const { affectedUsers, courseId } = payload;
  await Promise.all(affectedUsers.map(async (u) => {
    if (!u.email) return;
    try {
      await mailer.sendMail(u.email, `Kurs abgesagt (ID: ${courseId})`, 'Der Kurs wurde abgesagt. Deine Buchung wurde entfernt.');
    } catch (e) {
      console.error('[pubsubNotifier] mail error', e);
    }
  }));
});

// 🧩 Kurs wieder verfügbar: WebSocket + Mail
bus.on('courseAvailableAgain', async (payload) => {
  return PerfMonitor.measureAsync('PubSub.notifyCourseAvailableAgain', async () => {
    const { interestedUsers, course } = payload;
    const io = WebSocketContext.getIO ? WebSocketContext.getIO() : (WebSocketContext.io || null);
    if (!io) return;
    const notification = {
      type: 'course:available',
      courseId: course.id,
      message: `Kurs-Update: ${course.title} hat jetzt ${course.seatsAvailable} freie Plätze.`,
      timestamp: new Date().toISOString()
    };
    interestedUsers.forEach(u => {
      try { io.to(`user_${u.user_id}`).emit('notification', notification); } catch (e) { console.error(e); }
    });
  });
});

bus.on('courseAvailableAgain', async (payload) => {
  const { interestedUsers, course } = payload;
  await Promise.all(interestedUsers.map(async (u) => {
    if (!u.email) return;
    try {
      await mailer.sendMail(
        u.email,
        `Kurs wieder verfügbar: ${course.title}`,
        `Im Kurs "${course.title}" ist wieder ein Platz frei (${course.seatsAvailable} verfügbar).`
      );
    } catch (e) {
      console.error('[pubsubNotifier] mail error', e);
    }
  }));
});

// 🧩 Änderung hier: emit wird "awaited" – alle Listener werden ausgeführt ✅
async function publishCourseDeleted(affectedUsers, courseId) {
  await Promise.all(
    bus.listeners('courseDeleted').map(fn =>
      fn({ affectedUsers, courseId })
    )
  );
}

// 🧩 Änderung hier: emit wird "awaited" – alle Listener werden ausgeführt ✅
async function publishCourseAvailableAgain(interestedUsers, course) {
  await Promise.all(
    bus.listeners('courseAvailableAgain').map(fn =>
      fn({ interestedUsers, course })
    )
  );
}

module.exports = {
  publishCourseDeleted,
  publishCourseAvailableAgain,
  bus
};
