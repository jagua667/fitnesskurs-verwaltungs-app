import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,  Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CourseCalendar from '../../components/CourseCalendar';
import CourseItem from '../../components/CourseItem';
import CourseForm from '../../components/CourseForm';
import { mockCourses } from '../../mock/courses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarIcon from '@mui/icons-material/Star'; // voller Stern
import StarBorderIcon from '@mui/icons-material/StarBorder'; // leerer Stern

const TrainerDashboard = () => {
  const [courses, setCourse] = useState(mockCourses);
  // TODO: warum confirmOpen UND formOpen? Frage dazu stellen
   const [rating, setRating] = useState([
  {
    id: 1,
    courseId: 1,
    stars: 4,
    comment: 'Super Kurs!',
    user: 'Anna',
    date: new Date().toLocaleString() // Speichert das aktuelle Datum und Uhrzeit
  },
  {
    id: 2,
    courseId: 4,
    stars: 5,
    comment: 'Sehr motivierend.',
    user: 'Ben',
    date: new Date().toLocaleString()
  },
  {
    id: 3,
    courseId: 5,
    stars: 3,
    comment: 'Kurs war anstrengend.',
    user: 'Ben',
    date: new Date().toLocaleString()
  }
]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
// Direkt nach den useState-Hooks einfügen:
const buchungenAnzahl = courses.reduce((summe, course) => {
  return summe + (course.participant ? course.participant.length : 0);
}, 0);

const durchschnittBewertung = rating.length
  ? (rating.reduce((sum, b) => sum + b.stars, 0) / rating.length).toFixed(1)
  : 'Keine Bewertungen';

    const handleDeleteClick = (course) => {
      setCourseToDelete(course);
      setConfirmOpen(true);
    };

    const confirmDelete = () => {
      setCourse(prev => prev.filter(k => k.id !== courseToDelete.id));
      setConfirmOpen(false);
      setCourseToDelete(null);
    };

    const cancelDelete = () => {
      setConfirmOpen(false);
      setCourseToDelete(null);
    };

  const handleSave = (course) => {
    setCourse(prev => {
      if (course.id) {
        return prev.map(k => (k.id === course.id ? course : k));
      }
      return [...prev, { ...course, id: Date.now() }];
    });
    setFormOpen(false);
    setEditCourse(null);
  };

 const calendarEvents = courses.map(k => ({
  title: `${k.name}\n${k.time}`, // Kursname in Zeile 1, Uhrzeit in Zeile 2
  start: k.date,
  allDay: true,
  extendedProps: {
    room: k.room,
    participant: k.teilnehmer || []
  }
}));

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
  const ratingRows = rating.map(b => {
    const course = courses.find(k => k.id === b.courseId);
    return [
      b.id,
      b.courseId,
      course?.name || '',
      b.stars,
      b.comment,
      b.user
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
  const courseRatings = rating.filter(b => b.courseId === course.id);
  const avg =
    courseRatings.length > 0
      ? courseRatings.reduce((sum, b) => sum + b.stars, 0) / courseRatings.length
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
  const courseRatings = rating.filter(b => b.courseId === k.id);

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
          i < b.stars ? (
            <StarIcon key={i} sx={{ color: '#fbc02d', ml: 0.5 }} />
          ) : (
            <StarBorderIcon key={i} sx={{ color: '#ccc', ml: 0.5 }} />
          )
        )}
        <Typography component="span" sx={{ ml: 1 }}>({b.stars})</Typography>
      </Typography>
      <Typography variant="body2"><strong>Kommentar:</strong> {b.comment}</Typography>
      <Typography variant="caption"><strong>Von:</strong> {b.user}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        <strong>Bewertungszeit:</strong> {b.date}
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
  <Typography variant="h6">Gesamte Buchungen: {buchungenAnzahl}</Typography>
  <Typography variant="h6">Durchschnittliche Bewertung: {durchschnittBewertung}</Typography>

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

