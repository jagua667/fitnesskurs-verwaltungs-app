import React, { useState, useMemo } from 'react';
import { expandRecurringCourses, mapCourse } from "../../utils/courseHelpers";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import CourseCalendar from '../../components/CourseCalendar';
import CourseItem from '../../components/CourseItem';
import CourseForm from '../../components/CourseForm';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarIcon from '@mui/icons-material/Star'; // voller Stern
import StarBorderIcon from '@mui/icons-material/StarBorder'; // leerer Stern
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const TrainerDashboard = () => {
  const { user, token } = useAuth();
  const tokenFromSessionStorage = sessionStorage.getItem('token');;

  // Lokaler Zustand für Kurse, Bewertungen, Formular, Kalender etc.
  const [courses, setCourses] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  // Lädt Kurse & Bewertungen für Trainer beim Initialisieren
  useEffect(() => {
    const fetchTrainerCourses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/trainer/courses', {
          headers: {
            Authorization: `Bearer ${tokenFromSessionStorage}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Fehler beim Laden der Kurse: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Ergebnis von /api/trainer/courses: ", data);
        let allExpandedCourses = [];

        // Kurse normalisieren und wiederkehrende Termine auflösen
        data.forEach(course => {
          const mapped = mapCourse(course);
          const expanded = expandRecurringCourses(mapped);
          allExpandedCourses.push(...expanded);
        });

        setExpandedCourses(allExpandedCourses);
        setCourses(data);
      } catch (error) {
        console.error('Fehler beim Laden der Trainer-Kurse:', error);
      }
    };

    const fetchRatings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ratings/trainer', {
          headers: {
            Authorization: `Bearer ${tokenFromSessionStorage}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Fehler beim Laden der Bewertungen: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setRatings(data);
      } catch (error) {
        console.error('Fehler beim Laden der Bewertungen:', error);
      }
    };

    if (user?.role === 'trainer') {
      fetchTrainerCourses();
      fetchRatings();
    }
  }, [user, token]);

  // Buchungszähler und Durchschnittsbewertung berechnen
  const bookingCount = courses.reduce((summe, course) => {
    return summe + (course.participant ? course.participant.length : 0);
  }, 0);

  const averageRating = ratings.length
    ? (ratings.reduce((sum, b) => sum + b.rating, 0) / ratings.length).toFixed(1)
    : 'Keine Bewertungen';

  // Kurs löschen
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokenFromSessionStorage}`,
        },
      });

      if (!res.ok) throw new Error('Fehler beim Löschen des Kurses');

      setCourses(prev => prev.filter(k => k.id !== courseToDelete.id));
      setConfirmOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setCourseToDelete(null);
  };

  // Kurs speichern oder aktualisieren
  const handleSave = async (course) => {
    try {
      let response;
      console.log("course.id: ", course.id);
      if (course.id) {
        // Bestehenden Kurs aktualisieren
        response = await fetch(`http://localhost:5000/api/courses/${course.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromSessionStorage}`,
          },
          body: JSON.stringify(course),
        });
      } else {
        // Neuen Kurs erstellen
        response = await fetch('http://localhost:5000/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenFromSessionStorage}`,
          },
          body: JSON.stringify(course),
        });
      }

      if (!response.ok) throw new Error('Fehler beim Speichern des Kurses');

      const savedCourse = await response.json();
      const mappedCourse = mapCourse(savedCourse);
      const expanded = expandRecurringCourses(mappedCourse);

      // State aktualisieren
      setCourses(prev => {
        const updated = course.id
          ? prev.map(k => (k.id === savedCourse.id ? savedCourse : k))
          : [...prev, savedCourse];
        return updated;
      });

      setExpandedCourses(prev => {
        const updated = course.id
          ? [
            ...prev.filter(c => c.original_id !== savedCourse.id),
            ...expanded
          ]
          : [...prev, ...expanded];
        return updated;
      });

      setFormOpen(false);
      setEditCourse(null);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };


  // Daten für Kalender-Ansicht
  const calendarEvents = expandedCourses.map(k => ({
    title: `${k.name}\n${k.time || ""}`,
    start: k.start,
    end: k.end,
    allDay: false,
    extendedProps: {
      room: k.room,
      participant: k.participant || [],
      participant_count: k.participant_count || 0
    }
  }));

  // CSV-Export von Kurs- & Bewertungsdaten
  const handleExport = () => {
    // --- Kurse ---
    const courseHeaders = ['ID', 'Name', 'Beschreibung', 'Datum', 'Uhrzeit', 'Ort', 'Teilnehmeranzahl'];
    const courseRows = courses.map(course => [
      course.id,
      course.name,
      course.description || '',
      course.date,
      course.time,
      course.room,
      course.participant ? course.participant.length : 0
    ]);

    const courseCSV = [
      courseHeaders.join(','),
      ...courseRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // --- Bewertungen ---
    const ratingHeaders = ['ID', 'Kurs-ID', 'Kursname', 'Sterne', 'Kommentar', 'Nutzer'];
    const ratingRows = ratings.map(b => {
      const course = courses.find(k => k.id === b.course_id);
      return [
        b.id,
        b.course_id,
        course?.name || '',
        b.rating,
        b.comment,
        b.user_name
      ];
    });

    const ratingCSV = [
      ratingHeaders.join(','),
      ...ratingRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const finalCSV = `KURSDATEN:\n${courseCSV}\n\nBEWERTUNGEN:\n${ratingCSV}`;

    const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trainer_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Daten für das Balkendiagramm
  const chartData = courses.map(course => {
    const courseRatings = ratings.filter(b => b.course_id === course.id);
    const avg =
      courseRatings.length > 0
        ? courseRatings.reduce((sum, b) => sum + b.rating, 0) / courseRatings.length
        : 0;
    return {
      name: course.name,
      rating: Number(avg.toFixed(2)),
      participant: course.participant?.length || 0,
    };
  });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Trainer Dashboard</Typography>

      {/* Kalender */}
      <Accordion defaultExpanded sx={{ marginBottom: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
          backgroundColor: '#f5f5f5',
          paddingY: 1.5,
          paddingX: 2,
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            fontSize: '1rem',
          },
        }}>
          <Typography variant="h5">Kalenderansicht deiner Kurse</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CourseCalendar events={calendarEvents} />
        </AccordionDetails>
      </Accordion>

      {/* Kursliste und Bewertungen */}
      <Accordion defaultExpanded sx={{ marginBottom: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
          backgroundColor: '#f5f5f5',
          paddingY: 1.5,
          paddingX: 2,
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            fontSize: '1rem',
          },
        }}>
          <Typography variant="h5">Deine Kurse und Bewertungen verwalten</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {courses.map((k, index) => {
            const courseRatings = ratings.filter(b => b.course_id === k.id);

            return (
              <React.Fragment key={k.id}>
                <CourseItem
                  course={k}
                  onEdit={() => {
                    const [start_time, end_time] = k.time?.split(' - ') || [null, null];

                    const parsedDate = k.date instanceof Date ? k.date : new Date(k.date);

                    setEditCourse({
                      ...k,
                      start_time,
                      end_time,
                      date: parsedDate, // <<< Hier wichtig!
                    });

                    setFormOpen(true);
                  }}
                  onDelete={() => handleDeleteClick(k)}
                />

                {courseRatings.length > 0 ? (
                  courseRatings.map((b) => (
                    <Box key={b.id} mb={2} mt={1} ml={2} p={2} border="1px solid #ddd" borderRadius={2}>
                      <Typography variant="subtitle1" display="flex" alignItems="center">
                        <strong>Sterne:</strong>
                        {Array.from({ length: 5 }, (_, i) =>
                          i < b.rating ? (
                            <StarIcon key={i} sx={{ color: '#fbc02d', ml: 0.5 }} />
                          ) : (
                            <StarBorderIcon key={i} sx={{ color: '#ccc', ml: 0.5 }} />
                          )
                        )}
                        <Typography component="span" sx={{ ml: 1 }}>({b.rating})</Typography>
                      </Typography>
                      <Typography variant="body2"><strong>Kommentar:</strong> {b.comment}</Typography>
                      <Typography variant="caption"><strong>Von:</strong> {b.user_name}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        <strong>Bewertungszeit:</strong> {format(new Date(b.created_at), 'dd.MM.yyyy HH:mm:ss')}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" ml={2} mb={3}>
                    Keine Bewertungen für diesen Kurs vorhanden.
                  </Typography>
                )}
                {index === courses.length - 1 && (
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setFormOpen(true); setEditCourse(null); }}>
                    Neuer Kurs
                  </Button>
                )}


              </React.Fragment>
            );
          })}
        </AccordionDetails>
      </Accordion>

      {/* Statistiken */}
      <Accordion defaultExpanded sx={{ marginBottom: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
          backgroundColor: '#f5f5f5',
          paddingY: 1.5,
          paddingX: 2,
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            fontSize: '1rem',
          },
        }}>
          <Typography variant="h5">Statistiken</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6">Gesamte Buchungen: {bookingCount}</Typography>
          <Typography variant="h6">Durchschnittliche Bewertung: {averageRating}</Typography>

          <Box mt={3} height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#8884d8" name="Ø Bewertung" />
                <Bar dataKey="participant" fill="#82ca9d" name="Teilnehmerzahl" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Button variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleExport}>
            Daten exportieren
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Kursformular */}
      <CourseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        course={editCourse}
      />

      {/* Löschbestätigung */}
      <Dialog open={confirmOpen} onClose={cancelDelete}>
        <DialogTitle>Kurs löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Möchtest du den Kurs „{courseToDelete?.name}“ wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Abbrechen</Button>
          <Button onClick={confirmDelete} color="error">Löschen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainerDashboard;

