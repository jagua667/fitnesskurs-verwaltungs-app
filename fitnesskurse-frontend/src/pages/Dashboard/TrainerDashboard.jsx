import React, { useState, useMemo } from 'react';
import { expandRecurringCourses, mapCourse } from "../../utils/courseHelpers";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,  Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
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
  const tokenFromLocalStorage = localStorage.getItem('token');;
  const [courses, setCourses] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState([]);

    useEffect(() => {
      console.log("user: ", user);
      console.log("token: ", token);
      console.log("tokenFromLocalStorage:", tokenFromLocalStorage);
      const fetchTrainerCourses = async () => {
          try {
          const res = await fetch('http://localhost:5000/api/trainer/courses', {
            headers: {
              Authorization: `Bearer ${tokenFromLocalStorage}`,
            },
          });
          if (!res.ok) {
              throw new Error(`Fehler beim Laden der Kurse: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          console.log("Ergebnis von fetchTrainerCourses (api/trainer/courses): ", data);
          let allExpandedCourses = [];

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
          Authorization: `Bearer ${tokenFromLocalStorage}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Fehler beim Laden der Bewertungen: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Ergebnis von fetchRatings (api/ratings/trainer): ", data);
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

    const [ratings, setRatings] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
    // Direkt nach den useState-Hooks einfügen:
    const bookingCount = courses.reduce((summe, course) => {
      return summe + (course.participant ? course.participant.length : 0);
    }, 0);

    const averageRating = ratings.length
      ? (ratings.reduce((sum, b) => sum + b.rating, 0) / ratings.length).toFixed(1)
      : 'Keine Bewertungen';

    const handleDeleteClick = (course) => {
      setCourseToDelete(course);
      setConfirmOpen(true);
    };

    const confirmDelete = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${tokenFromLocalStorage}`,
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

   const handleSave = async (course) => {
      try {
        let response;
        if (course.id) {
          // Kurs aktualisieren (siehe nächster Punkt)
          response = await fetch(`http://localhost:5000/api/courses/${course.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenFromLocalStorage}`,
            },
            body: JSON.stringify(course),
          });
        } else {
          // Kurs neu erstellen
          response = await fetch('http://localhost:5000/api/courses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenFromLocalStorage}`,
            },
            body: JSON.stringify(course),
          });
        }

        if (!response.ok) throw new Error('Fehler beim Speichern des Kurses');

        const savedCourse = await response.json();
        setCourses(prev => {
          const updated = course.id
            ? prev.map(k => (k.id === savedCourse.id ? savedCourse : k))
            : [...prev, savedCourse];
          return updated;
        });

        setFormOpen(false);
        setEditCourse(null);
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
      }
    };


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
    console.log("calendarEvents: ", calendarEvents);


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
              setEditCourse(k);
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

    <CourseForm
      open={formOpen}
      onClose={() => setFormOpen(false)}
      onSave={handleSave}
      course={editCourse}
    />

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

