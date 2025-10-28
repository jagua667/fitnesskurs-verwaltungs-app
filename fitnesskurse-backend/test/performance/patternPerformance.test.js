// test/performance/patternPerformance.test.js
const { performance } = require('perf_hooks');
const { notifyCourseDeletion: observerNotify, notifyCourseAvailableAgain: observerAvailable } =
  require('../../src/services/notifications/observerNotifier');
const { createMediatorWithDefaults } = require('../../src/services/notifications/mediatorNotifier');
const { publishCourseDeleted, publishCourseAvailableAgain } =
  require('../../src/services/notifications/pubsubNotifier');
const WebSocketContext = require('../../src/websocket/WebSocketContext');
const mailer = require('../../src/services/mailer');

describe('Performance-Vergleich der Notification-Patterns', () => {
  const fakeIO = {
    to: () => ({ emit: () => {} }),
    emit: () => {}
  };

  const users = Array.from({ length: 200 }, (_, i) => ({
    user_id: i + 1,
    email: `user${i + 1}@example.com`
  }));

  const courseData = { id: 101, title: 'Testkurs', seatsAvailable: 2 };

  beforeAll(() => {
    WebSocketContext.getIO = () => fakeIO;
    mailer.sendMail = async () => {};
  });

  async function measure(fn, runs = 20) {
    const times = [];
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / runs;
    return avg;
  }

  test('Observer, Mediator und PubSub liegen alle im <10 ms-Bereich', async () => {
    const mediator = createMediatorWithDefaults();

    const observerAvg = await measure(() => observerNotify(users, courseData.id));
    const mediatorAvg = await measure(() =>
      mediator.notify(users, { courseId: courseData.id, message: 'Testlauf' })
    );
    const pubsubAvg = await measure(() => publishCourseDeleted(users, courseData.id));

    console.log('\n📊 Avg Deletion (ms):', {
      Observer: observerAvg.toFixed(2),
      Mediator: mediatorAvg.toFixed(2),
      PubSub: pubsubAvg.toFixed(2)
    });

    expect(observerAvg).toBeLessThan(10);
    expect(mediatorAvg).toBeLessThan(10);
    expect(pubsubAvg).toBeLessThan(10);
  });

  test('„Platz frei geworden“-Notifications bleiben ebenfalls performant (<10 ms)', async () => {
    const mediator = createMediatorWithDefaults();

    const observerAvg = await measure(() => observerAvailable(users, courseData));
    const mediatorAvg = await measure(() =>
      mediator.notify(users, { courseId: courseData.id, message: 'Platz frei' })
    );
    const pubsubAvg = await measure(() => publishCourseAvailableAgain(users, courseData));

    console.log('\n📊 Avg AvailableAgain (ms):', {
      Observer: observerAvg.toFixed(2),
      Mediator: mediatorAvg.toFixed(2),
      PubSub: pubsubAvg.toFixed(2)
    });

    expect(observerAvg).toBeLessThan(10);
    expect(mediatorAvg).toBeLessThan(10);
    expect(pubsubAvg).toBeLessThan(10);
  });
});

