import React, { useState } from 'react';
import {
  Box, Typography, Tabs,Tooltip, Tab, Snackbar, Alert, List, Divider, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Global } from '@emotion/react';
import Layout from '../components/Layout';
import CourseCalendar from '../components/CourseCalendar';
import BookingItem from '../components/BookingItem';
import RatingDialog from '../components/RatingDialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const MyBookings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [view, setAnsicht] = useState('liste');
  const [futureBookings, setFutureBookings] = useState([
    { id: 1, course: "Yoga Flow", date: "2025-05-05", time: "18:00", location: "Fitnow Böblingen", status: "Bestätigt", type: "Yoga" },
    { id: 2, course: "Body Pump", date: "2025-05-07", time: "19:00", location: "Fitnow Sindelfingen", status: "Bestätigt", type: "Krafttraining" },
  ]);
  const pastBookings = [
    { id: 3, course: "Zumba", date: "2025-05-01", time: "17:00", location: "Fitnow Stuttgart", type: "Cardio" },
    { id: 4, course: "Pilates", date: "2025-04-28", time: "09:00", location: "Fitnow Tübingen", type: "Yoga" },
  ];
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [ratedCourse, setRatedCourse] = useState(null);

  const handleCancel = (id) => {
    setFutureBookings(prev => prev.filter(b => b.id !== id));
    setSnackbarOpen(true);
  };

  const currentBookings = tabValue === 0 ? futureBookings : pastBookings;

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
            value={view}
            exclusive
            onChange={(_, newAnsicht) => newAnsicht && setAnsicht(newAnsicht)}
            aria-label="Ansicht wählen"
          >
            <ToggleButton value="list">Liste</ToggleButton>
            <ToggleButton value="calendar">Kalender</ToggleButton>
          </ToggleButtonGroup>
        </Box>

       {view === 'list' ? (
  <List>
    {currentBookings.map(booking => (
      <React.Fragment key={booking.id}>
        <BookingItem
          booking={booking}
          onCancel={handleCancel}
          isPast={tabValue === 1}
          onRate={setRatedCourse}
        />
        <Divider />
      </React.Fragment>
    ))}
  </List>
) : (
  <CourseCalendar
    events={currentBookings.map(b => ({
      title: `${b.course} (${b.time} Uhr, ${b.location})`,
      date: b.date,
    }))}
  />
)}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity="success">Buchung storniert</Alert>
        </Snackbar>

        <RatingDialog
          open={!!ratedCourse}
          course={ratedCourse}
          onClose={() => setRatedCourse(null)}
        />
      </Box>
    </Layout>
  );
};

export default MyBookings;

