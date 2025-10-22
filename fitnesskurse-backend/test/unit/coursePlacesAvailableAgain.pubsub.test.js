// test/unit/coursePlaceAvailableAgain.pubsub.test.js

jest.mock('../../src/services/mailer', () => ({
  sendMail: jest.fn(),
}));
const mailer = require('../../src/services/mailer');
const WebSocketContext = require('../../src/websocket/WebSocketContext');
const PerfMonitor = require('../../src/utils/perfMonitor');
const { bus, publishCourseAvailableAgain } = require('../../src/services/notifications/pubsubNotifier');

describe('PubSubNotifier - Platz frei (publishCourseAvailableAgain)', () => {
  let ioMock;
  const userList = [
    { user_id: 10, email: 'a@example.com' },
    { user_id: 11, email: 'b@example.com' }
  ];
  const courseData = { id: 303, title: 'Zumba', seatsAvailable: 3 };

  beforeEach(() => {
    ioMock = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
    if ('getIO' in WebSocketContext) {
      jest.spyOn(WebSocketContext, 'getIO').mockReturnValue(ioMock);
    } else {
      WebSocketContext.io = ioMock;
    }
    jest.spyOn(PerfMonitor, 'measureAsync').mockImplementation(async (_, fn) => await fn());
    mailer.sendMail.mockReset().mockResolvedValue();
  });

  afterEach(() => {
    // ❌ keine Listener mehr löschen, sonst bleiben keine übrig
    jest.restoreAllMocks();
  });

  test('emittiert WS-Events, wenn ein Kurs wieder verfügbar ist', async () => {
    await publishCourseAvailableAgain(userList, courseData);
    expect(ioMock.to).toHaveBeenCalledTimes(2);
    expect(ioMock.to).toHaveBeenCalledWith('user_10');
    expect(ioMock.to).toHaveBeenCalledWith('user_11');
  });

  test('sendet E-Mails an alle interessierten Benutzer', async () => {
    await publishCourseAvailableAgain(userList, courseData);
    expect(mailer.sendMail).toHaveBeenCalledTimes(2);
    expect(mailer.sendMail).toHaveBeenCalledWith(
      'a@example.com',
      expect.stringMatching(/Kurs wieder verfügbar/),
      expect.stringMatching(/Zumba/)
    );
    expect(mailer.sendMail).toHaveBeenCalledWith(
      'b@example.com',
      expect.stringMatching(/Kurs wieder verfügbar/),
      expect.stringMatching(/Zumba/)
    );
  });
});
