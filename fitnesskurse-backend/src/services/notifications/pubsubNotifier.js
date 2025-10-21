const EventEmitter = require('events');
const WebSocketContext = require('../../websocket/WebSocketContext');
const mailer = require('../mailer');
const PerfMonitor = require('../../utils/perfMonitor');

const bus = new EventEmitter();

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

function publishCourseDeleted(affectedUsers, courseId) {
  bus.emit('courseDeleted', { affectedUsers, courseId });
}

module.exports = { publishCourseDeleted, bus };
