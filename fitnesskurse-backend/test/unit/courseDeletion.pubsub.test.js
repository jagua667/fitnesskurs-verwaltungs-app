const pool = require('../../src/db');
jest.mock('../../src/db');

const WebSocketContext = require('../../src/websocket/WebSocketContext');
jest.mock('../../src/websocket/WebSocketContext', () => ({
  getIO: jest.fn()
}));

jest.mock('../../src/services/mailer', () => ({
  sendMail: jest.fn()
}));
const mailer = require('../../src/services/mailer');

const { deleteCourseAndCollectAffectedUsers } = require('../../src/services/courseDeletionService');
const { publishCourseDeleted } = require('../../src/services/notifications/pubsubNotifier');

describe('course deletion + pubsub notifications', () => {
  let client;
  beforeEach(() => {
    client = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(client);

    client.query.mockImplementation((sql) => {
      if (sql.match(/BEGIN|COMMIT|ROLLBACK/i)) return Promise.resolve({});
      if (sql.includes('SELECT') && sql.includes('bookings')) {
        return Promise.resolve({
          rows: [{ booking_id: 31, user_id: 9, email: 'pubsub@example.com' }],
          rowCount: 1
        });
      }
      if (sql.includes('DELETE FROM bookings')) return Promise.resolve({ rowCount: 1 });
      if (sql.includes('DELETE FROM courses')) {
        return Promise.resolve({ rows: [{ id: 300 }], rowCount: 1 });
      }
      return Promise.resolve({});
    });

    WebSocketContext.getIO.mockReturnValue({ to: () => ({ emit: jest.fn() }) });
    mailer.sendMail.mockResolvedValue(true);
  });

  test('deleteCourseAndCollectAffectedUsers returns affectedUsers', async () => {
    const res = await deleteCourseAndCollectAffectedUsers(300);
    expect(res.deletedCourseId).toBe(300);
    expect(res.affectedBookingsCount).toBe(1);
    expect(Array.isArray(res.affectedUsers)).toBe(true);
  });

  test('pubsubNotifier sends ws and mail', async () => {
    const affectedUsers = [{ user_id: 9, email: 'pubsub@example.com', booking_id: 31 }];
    const io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    WebSocketContext.getIO.mockReturnValue(io);

    // Hier die richtige Funktion:
    publishCourseDeleted(affectedUsers, 300);

    // Wir geben kurz Zeit für asynchrone EventEmitter-Callbacks
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(io.to).toHaveBeenCalledWith('user_9');
    expect(mailer.sendMail).toHaveBeenCalledWith('pubsub@example.com', expect.any(String), expect.any(String));
  });
});

afterAll(() => {
  jest.clearAllMocks();
});
