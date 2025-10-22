// src/services/notifications/mediatorNotifier.js
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

// --- bestehende Handler (unverändert für Deletion) ---
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

// --- NEU: Handler für "Platz frei" ---
const wsAvailableHandler = {
  handle: async (interestedUsers, meta) => {
    return PerfMonitor.measureAsync('Mediator.notifyCourseAvailableAgain', async () => {
      const io = WebSocketContext.getIO ? WebSocketContext.getIO() : (WebSocketContext.io || null);
      if (!io) return;
      const notification = {
        type: 'course:available',
        courseId: meta.courseId,
        message: `Kurs-Update: ${meta.title} hat jetzt ${meta.seatsAvailable} freie Plätze.`,
        timestamp: new Date().toISOString()
      };
      interestedUsers.forEach(u => {
        try { io.to(`user_${u.user_id}`).emit('notification', notification); } catch (e) { console.error(e); }
      });
    });
  }
};

const mailAvailableHandler = {
  handle: async (interestedUsers, meta) => {
    await Promise.all(interestedUsers.map(async u => {
      if (!u.email) return;
      try {
        const subject = `Kurs wieder verfügbar: ${meta.title}`;
        const text = `Hallo,\n\nIm Kurs "${meta.title}" ist wieder ein Platz frei (${meta.seatsAvailable} verfügbar).\n\nViele Grüße`;
        await mailer.sendMail(u.email, subject, text);
      } catch (e) { console.error('[mailAvailableHandler] error', e); }
    }));
  }
};

// --- Factory mit Defaults ---
function createMediatorWithDefaults() {
  const m = new NotificationMediator();
  m.register(wsHandler);
  m.register(mailHandler);
  return m;
}

// --- Neue Factory für "Platz frei" ---
function createMediatorForAvailability() {
  const m = new NotificationMediator();
  m.register(wsAvailableHandler);
  m.register(mailAvailableHandler);
  return m;
}

// Wrapper-Funktion, um beide Varianten komfortabel zu exportieren
async function notifyCourseAvailableAgain(interestedUsers, courseData) {
  const m = createMediatorForAvailability();
  await m.notify(interestedUsers, {
    courseId: courseData.id,
    title: courseData.title,
    seatsAvailable: courseData.seatsAvailable
  });
}

module.exports = {
  NotificationMediator,
  createMediatorWithDefaults,
  notifyCourseAvailableAgain
};
