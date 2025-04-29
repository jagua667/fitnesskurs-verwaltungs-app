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

