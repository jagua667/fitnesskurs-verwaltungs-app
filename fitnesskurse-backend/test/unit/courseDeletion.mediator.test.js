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
const { createMediatorWithDefaults } = require('../../src/services/notifications/mediatorNotifier');

describe('course deletion + mediator notifications', () => {
  let client;
  beforeEach(() => {
    client = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(client);

    client.query.mockImplementation((sql) => {
      if (sql.match(/BEGIN|COMMIT|ROLLBACK/i)) return Promise.resolve({});
      if (sql.includes('SELECT') && sql.includes('bookings')) {
        return Promise.resolve({
          rows: [{ booking_id: 21, user_id: 8, email: 'mediator@example.com' }],
          rowCount: 1
        });
      }
      if (sql.includes('DELETE FROM bookings')) return Promise.resolve({ rowCount: 1 });
      if (sql.includes('DELETE FROM courses')) {
        return Promise.resolve({ rows: [{ id: 200 }], rowCount: 1 });
      }
      return Promise.resolve({});
    });

    WebSocketContext.getIO.mockReturnValue({ to: () => ({ emit: jest.fn() }) });
    mailer.sendMail.mockResolvedValue(true);
  });

  test('deleteCourseAndCollectAffectedUsers returns affectedUsers', async () => {
    const res = await deleteCourseAndCollectAffectedUsers(200);
    expect(res.deletedCourseId).toBe(200);
    expect(res.affectedBookingsCount).toBe(1);
    expect(Array.isArray(res.affectedUsers)).toBe(true);
  });

  test('mediatorNotifier sends ws and mail', async () => {
    const affectedUsers = [{ user_id: 8, email: 'mediator@example.com', booking_id: 21 }];
    const io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    WebSocketContext.getIO.mockReturnValue(io);

    const mediator = createMediatorWithDefaults();
    await mediator.notify(affectedUsers, { courseId: 200, message: 'Der Kurs wurde abgesagt.' });

    expect(io.to).toHaveBeenCalledWith('user_8');
    expect(mailer.sendMail).toHaveBeenCalledWith('mediator@example.com', expect.any(String), expect.any(String));
  });
});

afterAll(() => {
  jest.clearAllMocks();
});
