import React, { useState } from 'react';
import {
  Box, Typography, Tabs,Tooltip, Tab, Snackbar, Alert, List, Divider, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Global } from '@emotion/react';
import Layout from '../components/Layout';
import KursKalender from '../components/KursKalender';
import BuchungItem from '../components/BuchungItem';
import BewertungDialog from '../components/BewertungDialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const MeineBuchungen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [ansicht, setAnsicht] = useState('liste');
  const [kommendeBuchungen, setKommendeBuchungen] = useState([
    { id: 1, kurs: "Yoga Flow", datum: "2025-05-05", zeit: "18:00", ort: "Fitnow Böblingen", status: "Bestätigt", art: "Yoga" },
    { id: 2, kurs: "Body Pump", datum: "2025-05-07", zeit: "19:00", ort: "Fitnow Sindelfingen", status: "Bestätigt", art: "Krafttraining" },
  ]);
  const vergangeneBuchungen = [
    { id: 3, kurs: "Zumba", datum: "2025-05-01", zeit: "17:00", ort: "Fitnow Stuttgart", art: "Cardio" },
    { id: 4, kurs: "Pilates", datum: "2025-04-28", zeit: "09:00", ort: "Fitnow Tübingen", art: "Yoga" },
  ];
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [bewerteterKurs, setBewerteterKurs] = useState(null);

  const handleCancel = (id) => {
    setKommendeBuchungen(prev => prev.filter(b => b.id !== id));
    setSnackbarOpen(true);
  };

  const aktuelleBuchungen = tabValue === 0 ? kommendeBuchungen : vergangeneBuchungen;

  return (
    <Layout>
<Global
  styles={{
    '.fc-event-title': {
      whiteSpace: 'normal !important',
      wordBreak: 'break-word',
      fontSize: '0.85rem',
    }
  }}
/>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>Meine Buchungen</Typography>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Kommende" />
          <Tab label="Vergangene" />
        </Tabs>

        <Box mt={2} mb={2}>
          <ToggleButtonGroup
            value={ansicht}
            exclusive
            onChange={(_, newAnsicht) => newAnsicht && setAnsicht(newAnsicht)}
            aria-label="Ansicht wählen"
          >
            <ToggleButton value="liste">Liste</ToggleButton>
            <ToggleButton value="kalender">Kalender</ToggleButton>
          </ToggleButtonGroup>
        </Box>

       {ansicht === 'liste' ? (
  <List>
    {aktuelleBuchungen.map(buchung => (
      <React.Fragment key={buchung.id}>
        <BuchungItem
          buchung={buchung}
          onCancel={handleCancel}
          isPast={tabValue === 1}
          onBewerten={setBewerteterKurs}
        />
        <Divider />
      </React.Fragment>
    ))}
  </List>
) : (
  <KursKalender
    events={aktuelleBuchungen.map(b => ({
      title: `${b.kurs} (${b.zeit} Uhr, ${b.ort})`,
      date: b.datum,
    }))}
  />
)}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity="success">Buchung storniert</Alert>
        </Snackbar>

        <BewertungDialog
          open={!!bewerteterKurs}
          kurs={bewerteterKurs}
          onClose={() => setBewerteterKurs(null)}
        />
      </Box>
    </Layout>
  );
};

export default MeineBuchungen;

