// src/services/courseDeletionService.js
const pool = require('../db');

async function deleteCourseAndCollectAffectedUsers(courseId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingsRes = await client.query(
      `SELECT b.id as booking_id, b.user_id, u.email
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.course_id = $1 AND b.status = 'booked'
       FOR UPDATE`,
      [courseId]
    );

    const affectedUsers = bookingsRes.rows.map(r => ({
      user_id: r.user_id,
      email: r.email,
      booking_id: r.booking_id
    }));

    if (bookingsRes.rowCount > 0) {
      await client.query(
        `DELETE FROM bookings WHERE course_id = $1 AND status = 'booked'`,
        [courseId]
      );
    }

    const courseDelRes = await client.query(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [courseId]
    );

    if (courseDelRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return { deletedCourseId: null, affectedBookingsCount: 0, affectedUsers: [] };
    }

    await client.query('COMMIT');

    return {
      deletedCourseId: courseDelRes.rows[0].id,
      affectedBookingsCount: bookingsRes.rowCount,
      affectedUsers
    };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { deleteCourseAndCollectAffectedUsers };

