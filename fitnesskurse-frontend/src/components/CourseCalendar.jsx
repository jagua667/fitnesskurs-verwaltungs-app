import React, { useState } from 'react'; // Import von useState für die Verwaltung des Dialogs und des ausgewählten Events
import FullCalendar from '@fullcalendar/react'; // Import von FullCalendar für den Kalender
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin für die Tagesansicht
import { Tooltip, Dialog, DialogTitle, DialogContent, Typography, List, ListItem } from '@mui/material'; // MUI-Komponenten für das Dialog-Layout
import { Global } from '@emotion/react'; // Globale CSS-Stile für FullCalendar

// Globale Stile für FullCalendar, z.B. Umbrüche im Titel und Anpassungen der Event-Darstellung
<Global styles={{
  '.fc .fc-event-title': {
    whiteSpace: 'pre-wrap', // erlaubt Zeilenumbrüche im Event-Titel
    fontSize: '0.9rem',
    lineHeight: 1.3,
  },
  '.fc-event': {
    backgroundColor: '#1976d2', // Hintergrundfarbe der Events
    color: '#fff', // Textfarbe der Events
    border: 'none', // Kein Rand
    borderRadius: '8px', // Abgerundete Ecken
    padding: '4px 6px', // Innenabstand
  },
}} />

const CourseCalendar = ({ events }) => {
  // Definieren von States für den Dialog und das ausgewählte Event
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog sichtbar oder nicht
  const [selectedEvent, setSelectedEvent] = useState(null); // Speichert das ausgewählte Event

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin]} // Setzt das Plugin für die Monatsansicht
        initialView="dayGridMonth" // Startansicht des Kalenders (Monatsansicht)
        height="auto" // Automatische Höhe des Kalenders
        events={events} // Übergibt die Event-Daten
        eventContent={(arg) => {
          const room = arg.event.extendedProps?.room || arg.event.room;
          const participantCount = arg.event.extendedProps?.participantCount;
          const participantList = arg.event.extendedProps?.participant;
          const teilnehmerZahl = participantCount ?? (participantList?.length ?? 0);

          return (
            <Tooltip title={arg.event.title}>
              <div
                style={{
                  padding: 2,
                  fontSize: '0.85rem',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {arg.event.start.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} – {arg.event.title}
                <br />
                📍 {room} · 👥 {teilnehmerZahl}
              </div>
            </Tooltip>
          );
        }}
        eventClick={(info) => { // Wenn auf ein Event geklickt wird
          setSelectedEvent(info.event); // Speichert das ausgewählte Event in stateconsole.log("Selected Event:", info.event); // Überprüfe das gesamte Event
  console.log("Extended Props:", info.event.extendedProps); // Überprüfe extendedProps
          setDialogOpen(true); // Öffnet den Dialog
         }}
      />

      {/* Dialog zeigt die Details des ausgewählten Events */}
   <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
  <DialogTitle>{selectedEvent?.title}</DialogTitle>
  <DialogContent>
    <Typography>Teilnehmer:</Typography>
    <List>
      {selectedEvent?.extendedProps?.participant?.length > 0 ? (
        selectedEvent?.extendedProps?.participant.map((name, idx) => (
          <ListItem key={idx}>{name}</ListItem>
        ))
      ) : (
        <ListItem>Keine Teilnehmer vorhanden</ListItem>
      )}
    </List>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default CourseCalendar;

