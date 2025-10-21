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
jest.mock('../../src/services/mailer');

const { deleteCourseAndCollectAffectedUsers } = require('../../src/services/courseDeletionService');
const observerNotifier = require('../../src/services/notifications/observerNotifier');

describe('course deletion + observer notifications', () => {
  let client;
  beforeEach(() => {
    client = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(client);

    client.query.mockImplementation((sql) => {
      // Simuliere Transaktionsbefehle (BEGIN, COMMIT, ROLLBACK)
      if (sql.match(/BEGIN|COMMIT|ROLLBACK/i)) {
        return Promise.resolve({});
      }

      if (sql.includes('SELECT') && sql.includes('bookings')) {
        return Promise.resolve({
          rows: [{ booking_id: 11, user_id: 7, email: 'u@example.com' }],
          rowCount: 1
        });
      }

      if (sql.includes('DELETE FROM bookings')) {
        return Promise.resolve({ rowCount: 1 });
      }

      if (sql.includes('DELETE FROM courses')) {
        return Promise.resolve({ rows: [{ id: 100 }], rowCount: 1 });
      }

      // Default – falls sonst etwas ausgeführt wird
      return Promise.resolve({});
    });

    WebSocketContext.getIO.mockReturnValue({ to: () => ({ emit: jest.fn() }) });
    mailer.sendMail.mockResolvedValue(true);
  });

  test('deleteCourseAndCollectAffectedUsers returns affectedUsers', async () => {
    const res = await deleteCourseAndCollectAffectedUsers(100);
    expect(res.deletedCourseId).toBe(100);
    expect(res.affectedBookingsCount).toBe(1);
    expect(Array.isArray(res.affectedUsers)).toBe(true);
  });

  test('observerNotifier sends ws and mail', async () => {
    const affectedUsers = [{ user_id: 7, email: 'u@example.com', booking_id: 11 }];
    const io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    WebSocketContext.getIO.mockReturnValue(io);

    await observerNotifier.notifyCourseDeletion(affectedUsers, 100);
    expect(io.to).toHaveBeenCalledWith('user_7');
    expect(mailer.sendMail).toHaveBeenCalledWith('u@example.com', expect.any(String), expect.any(String));
  });
});

afterAll(() => {
  jest.clearAllMocks();
}); 