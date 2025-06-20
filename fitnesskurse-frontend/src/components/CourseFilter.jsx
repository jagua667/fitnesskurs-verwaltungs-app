/**
 * CourseFilter Komponente
 * 
 * Ermöglicht das Filtern von Kursen nach Zeit-Slots, Trainern und Studios.
 * 
 * Funktion:
 * - Lädt verfügbare Trainer und Standorte von APIs via axios beim Mount
 * - Zeigt auswählbare Filteroptionen für Zeiten, Trainer und Studios (Räume)
 * - Verwaltet Filterzustände über Props und Callbacks
 * - Bietet eine Schaltfläche, um die Filter anzuwenden (z.B. Suchergebnis aktualisieren)
 * 
 * Props:
 * - filterTimes: Array mit aktuell ausgewählten Zeit-Slots (z.B. ["Vormittag", "Abend"])
 * - filterRooms: Array mit aktuell ausgewählten Studios/Räumen
 * - filterTrainers: Array mit aktuell ausgewählten Trainer-IDs
 * - setFilterTimes: Setter-Funktion, um ausgewählte Zeit-Slots zu aktualisieren
 * - setFilterRooms: Setter-Funktion, um ausgewählte Studios zu aktualisieren
 * - setFilterTrainers: Setter-Funktion, um ausgewählte Trainer zu aktualisieren
 * - onApply: Callback-Funktion, die ausgeführt wird, wenn der Nutzer auf "Ergebnisse anzeigen" klickt
 * - onClose: Callback-Funktion zum Schließen des Filterdialogs
 * 
 * Intern:
 * - Zeit-Slots sind statisch definiert (Vormittag, Mittag, Nachmittag, Abend)
 * - Trainer und Räume werden bei Initialisierung via API geladen
 * - ToggleButton ist eine wiederverwendbare Komponente zur Auswahl/Abwahl von Filtern
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Zeit-Slots
const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

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
  // State für geladene Trainer und Standorte
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Daten vom Backend laden (Trainer, Studios)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainersRes, locationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/trainers"),
          axios.get("http://localhost:5000/api/locations"),
        ]);
        setAvailableTrainers(trainersRes.data);
        setAvailableLocations(locationsRes.data);
      } catch (err) {
        console.error("Fehler beim Laden der Filterdaten:", err);
      }
    };

    fetchData();
  }, []);

  // Hilfsfunktion: Ein-/Auswahl eines Items toggeln
  const toggleItem = (item, list, setter) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  // Wiederverwendbare Toggle-Schaltfläche für Filteroptionen
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

  return (
    <>
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
          overflowX: "hidden", // verhindert horizontale Verschiebung
        }}
      >
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
          {availableTrainers.map((trainer) => (
            <ToggleButton
              key={trainer.id}
              label={trainer.name}
              selected={filterTrainers.includes(trainer.id)}
              onClick={() => toggleItem(trainer.id, filterTrainers, setFilterTrainers)}
            />
          ))}
        </Box>

        {/* Studio */}
        <Typography variant="subtitle1" gutterBottom>
          Mein Studio
        </Typography>
        <Box sx={{ mb: 6 }}>
          {availableLocations.map((room) => (
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

        <Box sx={{ height: 100 }} />
      </Box>

      {/* Footer */}
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
