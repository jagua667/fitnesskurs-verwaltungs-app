// src/utils/courseHelpers.js

/**
 * Wandelt mockCourses in FullCalendar-kompatible Events um.
 * @param {Array} courses
 * @returns {Array} calendar events
 */
export function mapCoursesToEvents(courses) {
  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    start: `${course.date}T${course.time}`,
    room: course.room,
    trainer: course.trainer,
    teilnehmer: course.teilnehmer,
    extendedProps: {
      room: course.room,
      trainer: course.trainer,
      teilnehmer: course.teilnehmer,
      teilnehmerAnzahl: course.teilnehmer?.length || 0,
    },
  }));
}

/**
 * Filtert Kurse nach Zeitbereich (z. B. Vormittags, Nachmittags).
 * @param {Array} courses
 * @param {String} start
 * @param {String} end
 * @returns {Array} filtered courses
 */
export function filterCoursesByTimeRange(courses, startDate, endDate) {
  return courses.filter((course) => {
    const courseDate = new Date(`${course.date}T${course.time}`);
    return courseDate >= startDate && courseDate <= endDate;
  });
}
    
