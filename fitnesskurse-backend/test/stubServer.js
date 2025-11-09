// test/stubServer.js
// Node 18+, Express + ws (kein Socket.IO).
// Start:  node test/stubServer.js  (PORT=5000 optional)
// Patternwahl:  env PATTERN=observer|mediator|pubsub  ODER pro-Request ?pattern=...

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 5000;
const DEFAULT_PATTERN = process.env.PATTERN || 'observer'; // fallback

// --------- In-Memory Domain ----------
/**
 * Nutzerrollen:
 * - 'admin'  -> Baseline (Worst-Case) Broadcast
 * - 'trainer'
 * - 'kunde_interesse' (Kunden, die Kurse "beobachten")
 * - 'kunde_gebucht'   (Kunden, die gebucht haben / kritische Zustellung)
 */
const users = new Map(); // userId -> { userId, role, ws }
const courseSubscriptions = new Map(); // courseId -> Set<userId> (für 'kunde_interesse')
const bookedByCourse = new Map(); // courseId -> Set<userId> (für 'kunde_gebucht')
const bookings = new Map(); // bookingId -> { bookingId, courseId, userId }
const courses = new Map(); // courseId -> { courseId, capacity, occupied, deleted: boolean }

function ensureCourse(courseId) {
  if (!courses.has(courseId)) {
    courses.set(courseId, { courseId, capacity: 20, occupied: 0, deleted: false });
  }
  return courses.get(courseId);
}

// --------- WebSocket Registry ----------
/**
 * Client sendet direkt nach Verbindungsaufbau:
 * { type:'auth', userId:'u123', role:'kunde_interesse'|'kunde_gebucht'|'trainer'|'admin', interests:['c1','c2'], bookings:['b7', ...] }
 * - interests -> wird für 'kunde_interesse' registriert
 * - bookings  -> optional; wenn vorhanden, legen wir booking->course Zuordnung an (für cancel-Flows)
 */
function wireWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let myUser = null;

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'auth') {
          const { userId, role, interests = [], bookings: bookingIds = [], courseIdForBookings } = data;

          myUser = { userId, role, ws };
          users.set(userId, myUser);

          // Interessen registrieren (kunde_interesse)
          if (role === 'kunde_interesse') {
            for (const cid of interests) {
              ensureCourse(cid);
              if (!courseSubscriptions.has(cid)) courseSubscriptions.set(cid, new Set());
              courseSubscriptions.get(cid).add(userId);
            }
          }

          // Buchungen abbilden (kunde_gebucht)
          // Wenn bookingIds gegeben sind, brauchen wir courseIdForBookings (einfacher synthetischer Fall):
          if (role === 'kunde_gebucht' && Array.isArray(bookingIds) && bookingIds.length > 0 && courseIdForBookings) {
            const course = ensureCourse(courseIdForBookings);
            if (!bookedByCourse.has(course.courseId)) bookedByCourse.set(course.courseId, new Set());
            for (const bid of bookingIds) {
              bookings.set(bid, { bookingId: bid, courseId: course.courseId, userId });
              bookedByCourse.get(course.courseId).add(userId);
              course.occupied = Math.max(0, (course.occupied || 0) + 1);
              course.capacity = course.capacity || 20;
            }
          }

          ws.send(JSON.stringify({ type: 'auth/ok', pattern: DEFAULT_PATTERN }));
        }

      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    ws.on('close', () => {
      if (!myUser) return;
      users.delete(myUser.userId);
      // Aus Subscriptions entfernen:
      for (const [, set] of courseSubscriptions) set.delete(myUser.userId);
      for (const [, set] of bookedByCourse) set.delete(myUser.userId);
    });
  });

  return wss;
}

// --------- Notifier-Implementierungen ----------
/**
 * Einheitliches Nachrichtenformat:
 * { type:'notification', event:'course.deleted'|'course.available', courseId, meta:{...} }
 */
function sendToUserId(userId, payload) {
  const u = users.get(userId);
  if (u && u.ws && u.ws.readyState === 1) {
    try { u.ws.send(JSON.stringify(payload)); } catch (_) { }
  }
}
function broadcast(payload) {
  for (const [, u] of users) sendToUserId(u.userId, payload);
}

// Observer: Subject iteriert über passende Clients
const ObserverNotifier = {
  notifyCourseDeletion(courseId) {
    // Worst-Case (Baseline): an ALLE (inkl. Admin/Trainer/Kunden) -> Latenz-Referenz
    broadcast({ type: 'notification', event: 'course.deleted', courseId, meta: { pattern: 'observer', baseline: true } });
    // Zusätzlich „kritische“ Kunden (gebucht) wären im Observer auch erreicht (weil Broadcast)
  },
  notifyCourseAvailableAgain(courseId, thresholdCrossed) {
    // Selektiv an 'kunde_interesse' für diesen Kurs (wenn thresholdCrossed true)
    if (!thresholdCrossed) return;
    const subs = courseSubscriptions.get(courseId);
    if (subs) {
      for (const uid of subs) {
        sendToUserId(uid, { type: 'notification', event: 'course.available', courseId, meta: { pattern: 'observer', selective: true } });
      }
    }
  }
};

// Mediator: zentrale Verteilkomponente + Filterlogik
const MediatorNotifier = (() => {
  function route(event, courseId, options = {}) {
    const payload = { type: 'notification', event, courseId, meta: { pattern: 'mediator', ...options } };
    if (event === 'course.deleted') {
      // Admin + gebuchte Kunden + Trainer informiert (realistischer als Total-Broadcast)
      for (const [, u] of users) {
        if (u.role === 'admin' || u.role === 'trainer') sendToUserId(u.userId, payload);
      }
      const booked = bookedByCourse.get(courseId);
      if (booked) for (const uid of booked) sendToUserId(uid, payload);
    } else if (event === 'course.available' && options.thresholdCrossed) {
      const subs = courseSubscriptions.get(courseId);
      if (subs) for (const uid of subs) sendToUserId(uid, payload);
    }
  }
  return {
    notifyCourseDeletion(courseId) { route('course.deleted', courseId, { critical: true }); },
    notifyCourseAvailableAgain(courseId, thresholdCrossed) {
      if (thresholdCrossed) route('course.available', courseId, { thresholdCrossed: true });
    }
  };
})();

// Pub/Sub: Topics + Dispatcher (vereinfacht In-Memory, kein Redis/Kafka)
const PubSub = {
  topics: new Map(), // topic -> Set<userId>
  subscribe(topic, userId) {
    if (!this.topics.has(topic)) this.topics.set(topic, new Set());
    this.topics.get(topic).add(userId);
  },
  publish(topic, payload) {
    const subs = this.topics.get(topic);
    if (!subs) return;
    for (const uid of subs) sendToUserId(uid, payload);
  }
};

// Bei WS-Auth sofort die passenden Topics für Pub/Sub belegen:
function hookPubSubAutoSubscriptions() {
  for (const [, u] of users) {
    if (u.role === 'admin') PubSub.subscribe('admin', u.userId);
    if (u.role === 'trainer') PubSub.subscribe('trainer', u.userId);
    // Interesse: topic course/<id>/available
    // Gebucht:   topic course/<id>/critical
  }
}

const PubSubNotifier = {
  publishCourseDeleted(courseId) {
    // Kritische Topic + Admin/Trainer Topic
    const payload = { type: 'notification', event: 'course.deleted', courseId, meta: { pattern: 'pubsub', critical: true } };
    PubSub.publish(`course/${courseId}/critical`, payload);
    PubSub.publish('admin', payload);
    PubSub.publish('trainer', payload);
  },
  publishCourseAvailableAgain(courseId, thresholdCrossed) {
    if (!thresholdCrossed) return;
    const payload = { type: 'notification', event: 'course.available', courseId, meta: { pattern: 'pubsub', selective: true } };
    PubSub.publish(`course/${courseId}/available`, payload);
  }
};

// --------- Notifier-Facade (wie in deinen Controllern) ----------
function getPattern(req) {
  return (req.query.pattern || DEFAULT_PATTERN).toLowerCase();
}
const NotifierFacade = {
  notifyCourseDeletion(req, courseId) {
    const pattern = getPattern(req);
    if (pattern === 'observer') return ObserverNotifier.notifyCourseDeletion(courseId);
    if (pattern === 'mediator') return MediatorNotifier.notifyCourseDeletion(courseId);
    if (pattern === 'pubsub') return PubSubNotifier.publishCourseDeleted(courseId);
  },
  notifyCourseAvailableAgain(req, courseId, thresholdCrossed) {
    const pattern = getPattern(req);
    if (pattern === 'observer') return ObserverNotifier.notifyCourseAvailableAgain(courseId, thresholdCrossed);
    if (pattern === 'mediator') return MediatorNotifier.notifyCourseAvailableAgain(courseId, thresholdCrossed);
    if (pattern === 'pubsub') return PubSubNotifier.publishCourseAvailableAgain(courseId, thresholdCrossed);
  }
};

// --------- Express API (Stub der Controller) ----------
const app = express();
app.use(express.json());

// Einfache Helper: Subscriptions/Buchungen per REST setzen (für lokale Tests)
app.post('/api/debug/subscribe', (req, res) => {
  const { userId, courseId } = req.body;
  ensureCourse(courseId);
  if (!courseSubscriptions.has(courseId)) courseSubscriptions.set(courseId, new Set());
  courseSubscriptions.get(courseId).add(userId);
  // für Pub/Sub zusätzlich topic
  PubSub.subscribe(`course/${courseId}/available`, userId);
  res.json({ ok: true });
});
app.post('/api/debug/book', (req, res) => {
  const { bookingId, userId, courseId } = req.body;
  ensureCourse(courseId);
  bookings.set(bookingId, { bookingId, courseId, userId });
  if (!bookedByCourse.has(courseId)) bookedByCourse.set(courseId, new Set());
  bookedByCourse.get(courseId).add(userId);
  const course = courses.get(courseId);
  course.occupied = Math.min(course.capacity, (course.occupied || 0) + 1);
  // Pub/Sub: critical topic
  PubSub.subscribe(`course/${courseId}/critical`, userId);
  res.json({ ok: true });
});

// GET /api/feature -> 200
app.get('/api/feature', (req, res) => {
  res.status(200).json({ ok: true, feature: 'ping', now: Date.now() });
});

// POST /api/book -> 201 (gleiche Logik wie /api/debug/book, nur 201 und Pfad)
app.post('/api/book', (req, res) => {
  const { bookingId, userId, courseId } = req.body || {};
  if (!bookingId || !userId || !courseId) {
    return res.status(400).json({ error: 'missing bookingId|userId|courseId' });
  }
  ensureCourse(courseId);
  bookings.set(bookingId, { bookingId, courseId, userId });
  if (!bookedByCourse.has(courseId)) bookedByCourse.set(courseId, new Set());
  bookedByCourse.get(courseId).add(userId);
  const course = courses.get(courseId);
  course.occupied = Math.min(course.capacity, (course.occupied || 0) + 1);
  // Pub/Sub: critical topic (wie im Debug-Endpoint)
  PubSub.subscribe(`course/${courseId}/critical`, userId);
  res.status(201).json({ ok: true, bookingId, courseId, userId });
});

// GET /api/course/invalid -> 400
app.get('/api/course/invalid', (_req, res) => {
  res.status(400).json({ error: 'invalid course id' });
});

// === DELETE Booking (Stub von cancelBooking) ===
app.delete('/api/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const entry = bookings.get(bookingId);
  if (!entry) return res.status(404).json({ error: 'booking not found' });

  const course = ensureCourse(entry.courseId);
  const wasFull = course.capacity > 0 && course.occupied >= course.capacity;
  // Buchung stornieren
  bookings.delete(bookingId);
  if (bookedByCourse.has(course.courseId)) {
    bookedByCourse.get(course.courseId).delete(entry.userId);
  }
  course.occupied = Math.max(0, (course.occupied || 0) - 1);
  const thresholdCrossed = wasFull && course.occupied === course.capacity - 1; // 0->>=1 Plätze frei

  // Benachrichtigen (Observer/Mediator: notifyCourseAvailableAgain, PubSub: publishCourseAvailableAgain)
  NotifierFacade.notifyCourseAvailableAgain(req, course.courseId, thresholdCrossed);

  res.json({ ok: true, courseId: course.courseId, thresholdCrossed });
});

// === DELETE Course (Stub von deleteCourseHandler) ===
app.delete('/api/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const course = ensureCourse(courseId);
  course.deleted = true;

  // Benachrichtigen:
  // observer: notifyCourseDeletion
  // mediator: notifyCourseDeletion (über zentrale Logik)
  // pubsub:   publishCourseDeleted
  NotifierFacade.notifyCourseDeletion(req, courseId);

  // Aufräumen In-Memory
  bookedByCourse.delete(courseId);
  courseSubscriptions.delete(courseId);

  res.json({ ok: true, courseId });
});

// Einfache Health
app.get('/health', (_req, res) => res.json({ ok: true, users: users.size }));

// --------- Server Start ----------
const server = http.createServer(app);
wireWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Stub server running on http://localhost:${PORT} (ws path /ws), default pattern=${DEFAULT_PATTERN}`);
});
