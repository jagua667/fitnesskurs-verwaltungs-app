/**
 * CourseCard Komponente
 * 
 * Zeigt eine einzelne Kurskarte mit Name und Zeit an.
 * 
 * Features:
 * - Zeigt bei Hover eine halbtransparente Überlagerung mit dem Text "Online buchen"
 * - Klick auf die Karte löst die onClick-Funktion mit dem Kurs-Objekt aus
 * - Anzeige von Sternen kann mit renderStars Funktion erzeugt werden (optional)
 * 
 * Props:
 * - course: Objekt mit Kursdaten (mindestens `name` und `time` erforderlich)
 * - onClick: Callback-Funktion, die beim Klick auf die Karte mit dem Kurs-Objekt aufgerufen wird
 * 
 * Zustand:
 * - hovered: State, ob Maus über der Karte schwebt (für Hover-Effekt)
 * 
 * Wichtig:
 * - position: relative ist notwendig, damit das Hover-Overlay absolut relativ zur Karte positioniert werden kann
 * - pointerEvents: none im Overlay sorgt dafür, dass der Hover-Text keinen Klick blockiert
 */

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) =>
    i < rating ? <StarIcon key={i} fontSize="small" sx={{ color: 'gold' }} /> : <StarBorderIcon key={i} fontSize="small" sx={{ color: 'gold' }} />
  );

const CourseCard = ({ course, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
  <Box
  sx={{
    position: "relative", // wichtig!
    padding: 2,
    border: "1px solid #ddd",
    borderRadius: 2,
    cursor: "pointer",
    "&:hover": { backgroundColor: "#f0f0f0" },
  }}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onClick={() => onClick(course)}
>
  <Typography variant="h6">{course.name}</Typography>
  <Typography variant="body2">{course.time}</Typography>

  {hovered && (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        fontWeight: "bold",
        pointerEvents: "none", // lässt Klicks durch
      }}
    >
      Online buchen
    </Box>
  )}
</Box>
  );
};

export default CourseCard;

