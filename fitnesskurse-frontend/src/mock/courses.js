export const mockCourses = [
  {
    id: 1,
    name: "Yoga für Anfänger",
    description: "Ein sanfter Einstieg in die Welt des Yoga. Lerne Körper, Geist und Atem in Einklang zu bringen und finde innere Ruhe.",
    date: "2025-05-01",
    time: "10:30 - 11:30",
    room: "Raum 2",
    trainer: "Julia",
 teilnehmer: ["Lena", "Tim", "Fabian", "Nora", "Tobias"]
  },
  {
    id: 4,
    name: "Pump",
    description: "Ein intensives Langhantel-Workout, das dich formt und stärkt. Ideal für mehr Kraft und Ausdauer.",
    date: "2025-05-01",
    time: "09:00 - 10:00",
    room: "Raum 1",
trainer: "Ottmar",
 teilnehmer: ["Lena", "Tim", "Fabian", "Nora", "Tobias", "Claudia"]
  },
  {
    id: 5,
    name: "Yoga",
    description: "Entspannendes Yoga für Anfänger. Spüre neue Energie und verbessere deine Beweglichkeit mit gezielten Übungen.",
    date: "2025-05-01",
    time: "10:30 - 11:30",
    room: "Raum 2",
trainer: "Pep",
teilnehmer: ["Mira", "Jonas", "Sophie"]
  },
  // Weitere Kurse hier...
];

export const mappedEvents = mockCourses.map(course => ({
  id: course.id,
  title: course.name,
  start: course.date + 'T' + course.time.split(' - ')[0], 
  end: course.date + 'T' + course.time.split(' - ')[1], 
  room: course.room,
  extendedProps: {
    teilnehmer: course.teilnehmer,
  },
}));


