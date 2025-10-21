const WebSocketContext = require('../../websocket/WebSocketContext');
const mailer = require('../mailer');
const PerfMonitor = require('../../utils/perfMonitor');

async function notifyCourseDeletion(affectedUsers, courseId) {
  return PerfMonitor.measureAsync('Observer.notifyCourseDeletion', async () => {
      const io = WebSocketContext.getIO ? WebSocketContext.getIO() : (WebSocketContext.io || null);

      const notification = {
        type: 'course:deleted',
        courseId,
        message: 'Der Kurs wurde abgesagt.',
        timestamp: new Date().toISOString()
      };

      if (io) {
        affectedUsers.forEach(u => {
          try {
            io.to(`user_${u.user_id}`).emit('notification', notification);
          } catch (e) {
            console.error('[observerNotifier] WS emit failed for user', u.user_id, e);
          }
        });
      } else {
        console.warn('[observerNotifier] io not available, skipping websocket emits.');
      }

      await Promise.all(affectedUsers.map(async (u) => {
        if (!u.email) return;
        try {
          const subject = `Kurs abgesagt (ID: ${courseId})`;
          const text = `Hallo,\n\nleider wurde der Kurs (ID: ${courseId}) abgesagt. Deine Buchung wurde storniert.\n\nViele Grüße`;
          await mailer.sendMail(u.email, subject, text);
        } catch (e) {
          console.error('[observerNotifier] Mail error for', u.email, e);
        }
      }));
  });
}

module.exports = { notifyCourseDeletion };
