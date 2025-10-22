// test/unit/coursePlaceAvailableAgain.mediator.test.js
const WebSocketContext = require('../../src/websocket/WebSocketContext');
const PerfMonitor = require('../../src/utils/perfMonitor');
const { notifyCourseAvailableAgain } = require('../../src/services/notifications/mediatorNotifier');

jest.mock('../../src/services/mailer', () => ({
  sendMail: jest.fn(),
}));
const mailer = require('../../src/services/mailer');

describe('MediatorNotifier - Platz frei (notifyCourseAvailableAgain)', () => {
  let ioMock;
  const userList = [
    { user_id: 3, email: 'user3@example.com' },
    { user_id: 4, email: 'user4@example.com' }
  ];
  const courseData = { id: 202, title: 'Pilates', seatsAvailable: 1 };

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

  test('sendet WS-Benachrichtigungen über Mediator-Handler', async () => {
    await notifyCourseAvailableAgain(userList, courseData);

    expect(ioMock.to).toHaveBeenCalledTimes(2);
    expect(ioMock.to).toHaveBeenCalledWith('user_3');
    expect(ioMock.to).toHaveBeenCalledWith('user_4');
  });

  test('sendet E-Mails an interessierte Benutzer', async () => {
    await notifyCourseAvailableAgain(userList, courseData);

    expect(mailer.sendMail).toHaveBeenCalledTimes(2);
    expect(mailer.sendMail).toHaveBeenCalledWith(
      'user3@example.com',
      expect.stringMatching(/Kurs wieder verfügbar/),
      expect.stringMatching(/Pilates/)
    );
  });
});
