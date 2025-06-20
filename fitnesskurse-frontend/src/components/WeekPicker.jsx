/**
 * WeekPicker – Komponente zur Auswahl eines Datums (beginnend mit Wochenlogik)
 *
 * Diese Komponente zeigt einen Button, der bei Klick einen Kalender-Popover öffnet,
 * um ein Datum auszuwählen. Die ausgewählte Woche wird über `onDateChange` zurückgegeben.
 *
 * Props:
 * - `selectedDate` (Date): Das aktuell ausgewählte Datum
 * - `onDateChange` (Function): Callback-Funktion, wird aufgerufen, wenn ein neues Datum gewählt wurde
 *
 * Funktionen:
 * - Öffnet einen `Popover` mit einem `DateCalendar` aus dem MUI X Date-Picker
 * - Das Datum wird lokalisiert im deutschen Format angezeigt (Locale: `de`)
 * - Nach Auswahl wird das Datum an den Parent weitergegeben und der Popover geschlossen
 *
 * Technische Details:
 * - Nutzt `LocalizationProvider` mit `AdapterDateFns` und deutscher Lokalisierung
 * - Der Kalender ist standardmäßig auf das aktuelle Datum gesetzt, wenn kein `selectedDate` vorhanden ist
 * - Der Button zeigt den Monat und das Jahr der Auswahl, oder "Datum wählen", falls nichts gewählt wurde
 *
 * Hinweise:
 * - Die Auswahl basiert auf einem Tagesdatum, kann aber leicht zur Wochenlogik erweitert werden,
 *   z.B. durch Verwendung von `startOfWeek()` bei Bedarf.
 * - Die Übergabe erfolgt im lokalen Zeitformat ohne Zeitzonenverschiebung.
 */

import React, { useState } from "react";
import { Button, Popover } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { de } from "date-fns/locale";
import { startOfWeek } from "date-fns";

const WeekPicker = ({ selectedDate, onDateChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

 const handleDateChange = (date) => {
  const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Lokale Zeit ohne Zeitverschiebung
  onDateChange(selected);
  handleClose();
};

  const label = selectedDate
    ? new Date(selectedDate).toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      })
    : "Datum wählen";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Button onClick={handleOpen} variant="outlined">
        {label}
      </Button>
      <Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
        <DateCalendar
          value={selectedDate ? new Date(selectedDate) : new Date()}
          onChange={handleDateChange}
        />
      </Popover>
    </LocalizationProvider>
  );
};

export default WeekPicker;

