import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Global } from '@emotion/react';
import rrulePlugin from '@fullcalendar/rrule';
import { mockCourses } from '../mock/courses'; 
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const CourseCalendar = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const recurringEvents = mockCourses.map((course) => {
    const [startTime] = course.time.split(' - ');
    const startDateTime = `${course.date}T${startTime}`;

    return {
      title: `${course.name} mit ${course.trainer}`,
      rrule: {
        freq: 'weekly',
        interval: 1,
        dtstart: startDateTime,
      },
      duration: '01:00',
      extendedProps: {
        room: course.room,
        participant: course.teilnehmer,
      },
    };
  });

  return (
    <div>
      <Global
        styles={{
          '.fc .fc-event-title': {
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
            lineHeight: 1.3,
          },
          '.fc-event': {
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '4px 6px',
          },
        }}
      />

      <FullCalendar
        plugins={[dayGridPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        events={recurringEvents}
        height="auto"
        displayEventTime={false}
        eventContent={(arg) => {
          const room = arg.event.extendedProps?.room || 'kein Raum';
          const teilnehmer = arg.event.extendedProps?.participant || [];
          return (
            <div
              style={{
                padding: 2,
                fontSize: '0.85rem',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                cursor: 'pointer',
              }}
            >
              <div>{arg.event.title}</div>
              <div>📍 {room}</div>
              <div>👥 {teilnehmer.length}</div>
            </div>
          );
        }}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          setDialogOpen(true);
        }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="h6" component="div">
      {selectedEvent?.title}
    </Typography>
   <IconButton onClick={() => setDialogOpen(false)} size="small">
  <CloseIcon />
</IconButton>
  </Box>
</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Teilnehmerliste:</Typography>
          {selectedEvent?.extendedProps?.participant?.length > 0 ? (
            <Box>
              {selectedEvent.extendedProps.participant.map((name, idx) => (
                <Typography key={idx} variant="body1">{name}</Typography>
              ))}
            </Box>
          ) : (
            <Typography color="textSecondary">Keine Teilnehmer vorhanden.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCalendar;

