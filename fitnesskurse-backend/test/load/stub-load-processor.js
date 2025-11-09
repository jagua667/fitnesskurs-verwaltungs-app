// test/load/stub-load-processor.js
// Artillery processor (CommonJS)
const crypto = require('crypto');

function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function rndInt(max) { return Math.floor(Math.random() * max); }

function pickWeighted(weights) {
  const r = Math.random();
  let acc = 0;
  for (const [key, w] of Object.entries(weights)) {
    acc += w;
    if (r <= acc) return key;
  }
  return Object.keys(weights)[0];
}

module.exports = {
  beforeRequest(req, context, ee, next) {
    // a) Feature-Flow: POST /book mit eindeutiger bookingId versehen
    if (req && req.name === 'book') {
      // Falls CSV eine bookingId liefert, hänge eine kurze zufällige Suffix an
      const base = (req.json && req.json.bookingId) ? String(req.json.bookingId) : 'b';
      const suffix = crypto.randomBytes(3).toString('hex'); // 6 Zeichen
      req.json.bookingId = `${base}-${suffix}`;
      // Zusätzlich: userId füllen, falls leer
      if (!req.json.userId) req.json.userId = `u_${crypto.randomBytes(4).toString('hex')}`;
    }

    return next();
  },

  // Für WS-Listener: bereite authMessage vor
  async beforeScenario(ctx, ee, next) {
    if (ctx.scenario.name !== 'WS listeners subscribe') return next();

    const { share_admin, share_trainer, share_kunde_interesse, share_kunde_gebucht } = ctx.vars;
    const role = pickWeighted({
      admin: Number(share_admin),
      trainer: Number(share_trainer),
      kunde_interesse: Number(share_kunde_interesse),
      kunde_gebucht: Number(share_kunde_gebucht),
    });

    const userId = `u_${crypto.randomBytes(6).toString('hex')}`;
    const courses = (ctx.payload && ctx.payload[0]) ? ctx.payload[0].data.map(r => r.courseId) : Array.from({length:50}, (_,i)=>`c${i+1}`);

    // Interesse: 1-3 Kurse
    const interests = [];
    if (role === 'kunde_interesse') {
      const count = 1 + rndInt(3);
      for (let i=0;i<count;i++) interests.push(courses[rndInt(courses.length)]);
    }

    // Gebucht: 1 Kurs + 1-2 Buchungen
    const bookings = [];
    let courseIdForBookings = undefined;
    if (role === 'kunde_gebucht') {
      courseIdForBookings = courses[rndInt(courses.length)];
      const bCount = 1 + rndInt(2);
      for (let i=0;i<bCount;i++) bookings.push(`b_${crypto.randomBytes(4).toString('hex')}`);
    }

    const authMessage = JSON.stringify({
      type: 'auth',
      userId,
      role,
      interests,
      bookings,
      courseIdForBookings
    });

    ctx.vars.authMessage = authMessage;

    return next();
  },

  // Für mixedActions: wählt Admin-Delete oder Kunden-Cancel
  pickAction(ctx, ee, next) {
    const flip = Math.random();
    const courses = (ctx.payload && ctx.payload[0]) ? ctx.payload[0].data.map(r => r.courseId) : Array.from({length:50}, (_,i)=>`c${i+1}`);
    const bookingsCsv = (ctx.payload && ctx.payload[1]) ? ctx.payload[1].data : [];

    if (flip < 0.4) {
        ctx.vars.actionType = 'deleteCourse';
        ctx.vars.selCourseId = courses[rndInt(courses.length)];
    } else {
        // Kunden cancel booking
        let sel = null;
        if (bookingsCsv.length > 0) {
            const r = bookingsCsv[rndInt(bookingsCsv.length)];
            sel = { bookingId: r.bookingId };
        } else {
            sel = { bookingId: `b_${crypto.randomBytes(4).toString('hex')}` };
        }
        ctx.vars.actionType = 'cancelBooking';
        ctx.vars.selBookingId = sel.bookingId;

        // >>> HIER der Pre-Book-Block (VOR requestMethod/requestUrl):
        if (Math.random() < 0.7) { // 70% echte Buchung
            const courseId = courses[rndInt(courses.length)];
            const bookingId = `b_${crypto.randomBytes(4).toString('hex')}`;
            ctx.vars._preBook = {
            bookingId,
            courseId,
            userId: `u_${crypto.randomBytes(6).toString('hex')}`,
            };
            ctx.vars.selBookingId = bookingId; // überschreiben
        }
    }

    // Danach erst die URL bauen:
    if (ctx.vars.actionType === 'deleteCourse') {
        ctx.vars.requestMethod = 'DELETE';
        ctx.vars.requestUrl =
            `/api/courses/${ctx.vars.selCourseId}?pattern=${process.env.PATTERN || ctx.vars.pattern}`;
    } else {
        ctx.vars.requestMethod = 'DELETE';
        ctx.vars.requestUrl =
            `/api/bookings/${ctx.vars.selBookingId}?pattern=${process.env.PATTERN || ctx.vars.pattern}`;
    }

    return next();
  },

  // Nach jeder Antwort: Flag für Info-Zwecke (optional)
  afterResponse(req, res, context, ee, next) {
    if (req && req.name === 'book') {
      context.vars.okToDelete = (res && res.statusCode === 201);
      // Merke die tatsächlich verwendete bookingId (inkl. Suffix), damit DELETE passt
      if (req.json && req.json.bookingId) {
        context.vars.bookingId = req.json.bookingId;
      }
    }
    return next();
  }
};
