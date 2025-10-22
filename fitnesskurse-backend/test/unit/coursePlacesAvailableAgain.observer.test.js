// test/unit/coursePlaceAvailableAgain.observer.test.js
const WebSocketContext = require('../../src/websocket/WebSocketContext');
const PerfMonitor = require('../../src/utils/perfMonitor');
const { notifyCourseAvailableAgain } = require('../../src/services/notifications/observerNotifier');

jest.mock('../../src/services/mailer', () => ({
  sendMail: jest.fn(),
}));
const mailer = require('../../src/services/mailer');

describe('ObserverNotifier - Platz frei (notifyCourseAvailableAgain)', () => {
  let ioMock;
  const userList = [
    { user_id: 1, email: 'user1@example.com' },
    { user_id: 2, email: 'user2@example.com' }
  ];
  const courseData = { id: 101, title: 'Yoga', seatsAvailable: 2 };

  beforeEach(() => {
    ioMock = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    if ('getIO' in WebSocketContext) {
        jest.spyOn(WebSocketContext, 'getIO').mockReturnValue(ioMock);
    } else {
        WebSocketContext.io = ioMock; // fallback
    }
    jest.spyOn(PerfMonitor, 'measureAsync').mockImplementation(async (_, fn) => await fn());
    
    mailer.sendMail.mockReset().mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sendet WebSocket-Benachrichtigungen an alle interessierten Benutzer', async () => {
    await notifyCourseAvailableAgain(userList, courseData);

    expect(ioMock.to).toHaveBeenCalledTimes(2);
    expect(ioMock.to).toHaveBeenCalledWith('user_1');
    expect(ioMock.to).toHaveBeenCalledWith('user_2');
  });

  test('Nachricht enthält den Kurstitel und die Anzahl der freien Plätze', async () => {
    await notifyCourseAvailableAgain(userList, courseData);

    const emitMock = ioMock.to.mock.results[0].value.emit;
    const [eventName, payload] = emitMock.mock.calls[0];
    expect(eventName).toBe('notification');
    expect(payload.message).toMatch(/Yoga hat jetzt 2 freie Plätze/);
  });
});
