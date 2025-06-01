// src/utils/courseHelpers.js
import { addDays } from "date-fns";
// import { differenceInWeeks } from 'date-fns'; 

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

export function mapCourse (course) {
  console.log("Original backend course:", course);
  console.log(`Repeat: ${course.repeat}, Repeat Until: ${course.repeat_until}`);

  let start_time = course.start_time;
  let end_time = course.end_time;

  if (!start_time && course.time && course.date) {
    const [startStr, endStr] = course.time.split(" - ");
    start_time = `${course.date}T${startStr}:00`;
    end_time = `${course.date}T${endStr}:00`;
  }

  return {
    ...course,
    title: course.title || course.name || "Kein Titel",
    start: start_time,
    end: end_time,
    start_time,
    end_time,
    location: course.location || "Unbekannter Ort",
    trainer_name: course.trainer_name || "Unbekannter Trainer",
    rating: parseFloat(course.average_rating) || null,
    rating_count: course.rating_count || 0,
    repeat: course.repeat || 'none',
    repeat_until: course.repeat_until || null,
  };
};

export const expandRecurringCourses = (course) => {
  const occurrences = [];

  const start = new Date(course.start_time);
  const end = new Date(course.end_time);

  // Falls kein repeat gesetzt ist, normalen Kurs zurückgeben
  if (course.repeat === 'none' || !course.repeat) {
    return [mapCourse(course)];
  }

  const until = new Date(course.repeat_until);
  let currentStart = new Date(start);
  let currentEnd = new Date(end);

  while (currentStart <= until) {
    const repeatedCourse = {
      ...course,
      start_time: currentStart.toISOString(),
      end_time: currentEnd.toISOString(),
    };
    occurrences.push(mapCourse(repeatedCourse));

    // Für wöchentliche Wiederholung:
    if (course.repeat === 'weekly') {
      currentStart = addDays(currentStart, 7);
      currentEnd = addDays(currentEnd, 7);
    }
  }

  return occurrences;
};

    
