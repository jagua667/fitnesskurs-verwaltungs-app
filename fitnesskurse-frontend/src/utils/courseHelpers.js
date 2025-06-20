// src/utils/courseHelpers.js
import { addDays } from "date-fns";
// import { differenceInWeeks } from 'date-fns'; 

/**
 * Wandelt eine Liste von Kursobjekten in FullCalendar-kompatible Event-Objekte um.
 * @param {Array<Object>} courses - Array von Kursobjekten aus dem Backend.
 * @returns {Array<Object>} Array von Kalender-Events mit id, title, start, room usw.
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
 * Filtert Kurse nach einem bestimmten Zeitbereich (Datum + Uhrzeit).
 * Nützlich, um z.B. nur Vormittags- oder Nachmittagskurse zu bekommen.
 * 
 * @param {Array<Object>} courses - Array der Kursobjekte.
 * @param {Date} startDate - Startdatum des Zeitbereichs.
 * @param {Date} endDate - Enddatum des Zeitbereichs.
 * @returns {Array<Object>} Gefilterte Kurse, deren Datum/Uhrzeit im Bereich liegt.
 */
export function filterCoursesByTimeRange(courses, startDate, endDate) {
  return courses.filter((course) => {
    const courseDate = new Date(`${course.date}T${course.time}`);
    return courseDate >= startDate && courseDate <= endDate;
  });
}

/**
 * Mappt ein einzelnes Kursobjekt aus dem Backend in ein einheitliches Format.
 * Dabei werden Zeitangaben auf ISO-Strings gesetzt, Default-Werte gesetzt
 * und Zusatzinformationen wie Ratings hinzugefügt.
 * 
 * @param {Object} course - Kursobjekt vom Backend.
 * @returns {Object} Kurs im einheitlichen, erweiterten Format.
 */
export function mapCourse(course) {
  let start_time = course.start_time;
  let end_time = course.end_time;

  // Falls keine start/end-Zeiten vorhanden, aus `time` und `date` ableiten
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
    repeat: course.repeat || 'none',  // Wiederholungsintervall (z.B. weekly, none)
    repeat_until: course.repeat_until || null,   // Datum bis wann wiederholt wird
  };
};

/**
 * Expandiert einen wiederkehrenden Kurs in einzelne Instanzen.
 * Für z.B. einen wöchentlich wiederkehrenden Kurs werden alle einzelnen
 * Termine bis zum `repeat_until` Datum erzeugt.
 * 
 * @param {Object} course - Einzelner Kurs mit Wiederholungsangaben.
 * @returns {Array<Object>} Array von Kursinstanzen, jeweils mit eigenem Start/Endzeitpunkt.
 */
export const expandRecurringCourses = (course) => {
  const occurrences = [];

  const start = new Date(course.start_time);
  const end = new Date(course.end_time);

  // Wenn kein Wiederholungsintervall definiert, nur den Kurs selbst zurückgeben
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

    // Beispiel: bei wöchentlichen Wiederholungen jeweils 7 Tage addieren
    if (course.repeat === 'weekly') {
      currentStart = addDays(currentStart, 7);
      currentEnd = addDays(currentEnd, 7);
    }
    // Andere Wiederholungsarten könnten hier ergänzt werden
  }

  return occurrences;
};


