    import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,  Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KursKalender from '../../components/KursKalender';
import KursItem from '../../components/KursItem';
import KursForm from '../../components/KursForm';
import { mappedEvents, mockCourses } from '../../mock/courses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrainerDashboard = () => {
  const [kurse, setKurse] = useState(mockCourses);
  // TODO: warum confirmOpen UND formOpen? Frage dazu stellen
    const [bewertungen, setBewertungen] = useState([
      {
        id: 1,
        kursId: 1,
        stern: 4,
        kommentar: 'Super Kurs!',
        nutzer: 'Anna'
      },
      {
        id: 2,
        kursId: 4,
        stern: 5,
        kommentar: 'Sehr motivierend.',
        nutzer: 'Ben'
      },
 {
        id: 3,
        kursId: 5,
        stern: 3,
        kommentar: 'Kurs war anstrengend.',
        nutzer: 'Ben'
      },
    ]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [kursToDelete, setKursToDelete] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editKurs, setEditKurs] = useState(null);
// Direkt nach den useState-Hooks einfügen:
const buchungenAnzahl = kurse.reduce((summe, kurs) => {
  return summe + (kurs.teilnehmer ? kurs.teilnehmer.length : 0);
}, 0);

const durchschnittBewertung = bewertungen.length
  ? (bewertungen.reduce((sum, b) => sum + b.stern, 0) / bewertungen.length).toFixed(1)
  : 'Keine Bewertungen';

  // TODO: warum sowohl delete als auch handleDeleteClick? Kann ich handleDelete entfernen?
  const handleDelete = (id) => {
    setKurse(prev => prev.filter(k => k.id !== id));
  };

    const handleDeleteClick = (kurs) => {
      setKursToDelete(kurs);
      setConfirmOpen(true);
    };

    const confirmDelete = () => {
      setKurse(prev => prev.filter(k => k.id !== kursToDelete.id));
      setConfirmOpen(false);
      setKursToDelete(null);
    };

    const cancelDelete = () => {
      setConfirmOpen(false);
      setKursToDelete(null);
    };

  const handleSave = (kurs) => {
    setKurse(prev => {
      if (kurs.id) {
        return prev.map(k => (k.id === kurs.id ? kurs : k));
      }
      return [...prev, { ...kurs, id: Date.now() }];
    });
    setFormOpen(false);
    setEditKurs(null);
  };

  const kalenderEvents = kurse.map(k => ({
  title: `${k.name}\n🕒 ${k.time} | 📍 ${k.room}\n👥 ${k.teilnehmer?.length ?? 0} Teilnehmer`,
  date: k.date,
}));
const handleExport = () => {
  // --- Kurse ---
  const kursHeaders = ['ID', 'Name', 'Beschreibung', 'Datum', 'Uhrzeit', 'Ort', 'Teilnehmeranzahl'];
  const kursRows = kurse.map(kurs => [
    kurs.id,
    kurs.name,
    kurs.description || '',
    kurs.date,
    kurs.time,
    kurs.room,
    kurs.teilnehmer ? kurs.teilnehmer.length : 0
  ]);

  const kursCSV = [
    kursHeaders.join(','),
    ...kursRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // --- Bewertungen ---
  const bewertungHeaders = ['ID', 'Kurs-ID', 'Kursname', 'Sterne', 'Kommentar', 'Nutzer'];
  const bewertungRows = bewertungen.map(b => {
    const kurs = kurse.find(k => k.id === b.kursId);
    return [
      b.id,
      b.kursId,
      kurs?.name || '',
      b.stern,
      b.kommentar,
      b.nutzer
    ];
  });

  const bewertungCSV = [
    bewertungHeaders.join(','),
    ...bewertungRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const finalCSV = `KURSDATEN:\n${kursCSV}\n\nBEWERTUNGEN:\n${bewertungCSV}`;

  const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trainer_export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const chartData = kurse.map(kurs => {
  const kursBewertungen = bewertungen.filter(b => b.kursId === kurs.id);
  const avg =
    kursBewertungen.length > 0
      ? kursBewertungen.reduce((sum, b) => sum + b.stern, 0) / kursBewertungen.length
      : 0;
  return {
    name: kurs.name,
    bewertung: Number(avg.toFixed(2)),
    teilnehmer: kurs.teilnehmer?.length || 0,
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
        <KursKalender events={mappedEvents} />
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
{kurse.map((k, index) => {
  const kursBewertungen = bewertungen.filter(b => b.kursId === k.id);

  return (
    <React.Fragment key={k.id}>
      <KursItem
        kurs={k}
        onEdit={() => {
          setEditKurs(k);
          setFormOpen(true);
        }}
        onDelete={() => handleDeleteClick(k)}
      />

      {kursBewertungen.length > 0 ? (
        kursBewertungen.map((b) => (
          <Box key={b.id} mb={2} mt={1} ml={2} p={2} border="1px solid #ddd" borderRadius={2}>
            <Typography variant="subtitle1"><strong>Sterne:</strong> {b.stern}</Typography>
            <Typography><strong>Kommentar:</strong> {b.kommentar}</Typography>
            <Typography variant="caption"><strong>Von:</strong> {b.nutzer}</Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary" ml={2}>
          Keine Bewertungen für diesen Kurs vorhanden.
        </Typography>
      )}

      {/* Wenn dies der letzte Kurs ist, dann Button einfügen */}
      {index === kurse.length - 1 && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setFormOpen(true); setEditKurs(null); }}>
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
        <Bar dataKey="bewertung" fill="#8884d8" name="Ø Bewertung" />
        <Bar dataKey="teilnehmer" fill="#82ca9d" name="Teilnehmerzahl" />
      </BarChart>
    </ResponsiveContainer>
  </Box>

<Button variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleExport}>
  Daten exportieren
</Button>
 </AccordionDetails>
  </Accordion>

        <KursForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          kurs={editKurs}
        />

        <Dialog open={confirmOpen} onClose={cancelDelete}>
          <DialogTitle>Kurs löschen</DialogTitle>
            <DialogContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningAmberIcon color="warning" fontSize="large" />
              <Typography>
                Möchtest du den Kurs „{kursToDelete?.name}“ wirklich löschen?
              </Typography>
            </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="primary">Abbrechen</Button>
            <Button onClick={confirmDelete} color="error">Löschen</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default TrainerDashboard;

