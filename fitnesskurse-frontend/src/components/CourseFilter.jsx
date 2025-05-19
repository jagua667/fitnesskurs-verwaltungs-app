import React from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Beispielwerte
const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

const studios = ["Fitnow Böblingen", "Fitnow Tübingen", "Fitnow Berlin_Lichtenberg"];
const trainers = ["Jürgen", "Pep", "Ottmar", "Jennifer", "Alexia", "Emma"];

// Wiederverwendbare Toggle-Schaltfläche
const ToggleButton = ({
  label,
  selected,
  onClick,
  fullWidth = false,
  large = false,
  noBorder = false,
  withShadow = false,
}) => (
  <Button
    variant={selected ? "contained" : "outlined"}
    onClick={onClick}
    fullWidth={fullWidth}
    sx={{
      m: 0.5,
      height: large ? 48 : "auto",
      justifyContent: "flex-start",
      textTransform: "none",
      px: 2,
      boxShadow: withShadow ? "0px 2px 4px rgba(0,0,0,0.2)" : "none",
      borderColor: selected
        ? undefined
        : noBorder
        ? "transparent"
        : "rgba(0, 0, 0, 0.23)",
    }}
  >
    {label}
  </Button>
);

const CourseFilter = ({
  filterTimes,
  filterRooms,
  filterTrainers,
  setFilterTimes,
  setFilterRooms,
  setFilterTrainers,
  onApply,
  onClose,
}) => {
  const toggleItem = (item, list, setter) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
  <>
    {/* Filter-Inhalt mit Padding */}
    <Box
      sx={{
        width: "100%",
        maxWidth: 520,
        mx: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        px: 3,
        pt: 4,
      }}
    >
      {/* X-Schließen Button */}
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <Button onClick={onClose} sx={{ minWidth: "auto", padding: 0 }}>
          ✕
        </Button>
      </Box>

      <Typography variant="h6" align="center" gutterBottom>
        Filter
      </Typography>

      {/* Zeiten */}
      <Typography variant="subtitle1" gutterBottom>
        Zeiten
      </Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap" }}>

       {timeSlots.map((slot) => (
  <ToggleButton
    key={slot.label}
    label={slot.label}
    selected={filterTimes.includes(slot.label)}
    onClick={() => toggleItem(slot.label, filterTimes, setFilterTimes)}
  />
))}

      </Box>

      {/* Trainer */}
      <Typography variant="subtitle1" gutterBottom>
        Trainer
      </Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap" }}>
        {trainers.map((trainer) => (
          <ToggleButton
            key={trainer}
            label={trainer}
            selected={filterTrainers.includes(trainer)}
            onClick={() => toggleItem(trainer, filterTrainers, setFilterTrainers)}
          />
        ))}
      </Box>

      {/* Studio */}
      <Typography variant="subtitle1" gutterBottom>
        Mein Studio
      </Typography>
      <Box sx={{ mb: 6 }}>
        {studios.map((room) => (
          <ToggleButton
            key={room}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <span>{room}</span>
              </Box>
            }
            selected={filterRooms.includes(room)}
            onClick={() => toggleItem(room, filterRooms, setFilterRooms)}
            fullWidth
            large
            noBorder
            withShadow
          />
        ))}
      </Box>

      {/* Abstand für Footer */}
      <Box sx={{ height: 100 }} />
    </Box>

    {/* Footer OHNE Padding-Left */}
    <Box
      sx={{
        width: "100%",
        position: "sticky",
        bottom: 0,
        left: 0,
        backgroundColor: "#f5f5f5",
        boxShadow: "inset 0 1px 6px rgba(0,0,0,0.1)",
        p: 2,
        px: 0,
        zIndex: 1300,
      }}
    >
      <Box sx={{ maxWidth: 520, mx: "auto", px: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onApply}
          sx={{
            height: 64,
            background: "linear-gradient(to bottom, #64b5f6, #1976d2)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
            textTransform: "none",
            "&:hover": {
              background: "linear-gradient(to bottom, #42a5f5, #1565c0)",
            },
          }}
        >
          Ergebnisse anzeigen
        </Button>
      </Box>
    </Box>
  </>
);
};

export default CourseFilter;

