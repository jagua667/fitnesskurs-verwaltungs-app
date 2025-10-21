const WebSocketContext = require('../../websocket/WebSocketContext');
const mailer = require('../mailer');
const PerfMonitor = require('../../utils/perfMonitor');

class NotificationMediator {
  constructor() {
    this.handlers = [];
  }

  register(handler) {
    if (typeof handler.handle !== 'function') {
      throw new Error('Handler must implement handle(affectedUsers, meta)');
    }
    this.handlers.push(handler);
  }

  async notify(affectedUsers, meta = {}) {
    await Promise.all(this.handlers.map(h => h.handle(affectedUsers, meta).catch(err => {
      console.error('[NotificationMediator] handler failed', err);
    })));
  }
}

const wsHandler = {
  handle: async (affectedUsers, meta) => {
    return PerfMonitor.measureAsync('Mediator.notifyCourseDeletion', async () => {
      const io = WebSocketContext.getIO ? WebSocketContext.getIO() : (WebSocketContext.io || null);
      if (!io) return;
      const notification = { type: 'course:deleted', courseId: meta.courseId, message: meta.message };
      affectedUsers.forEach(u => {
        try { io.to(`user_${u.user_id}`).emit('notification', notification); } catch (e) { console.error(e); }
      });
    });
  }
};

const mailHandler = {
  handle: async (affectedUsers, meta) => {
    await Promise.all(affectedUsers.map(async u => {
      if (!u.email) return;
      try {
        await mailer.sendMail(u.email, `Kurs abgesagt (ID: ${meta.courseId})`, meta.message || 'Kurs abgesagt');
      } catch (e) { console.error('[mailHandler] error', e); }
    }));
  }
};

function createMediatorWithDefaults() {
  const m = new NotificationMediator();
  m.register(wsHandler);
  m.register(mailHandler);
  return m;
}

module.exports = { NotificationMediator, createMediatorWithDefaults };
