// src/components/CourseItem.jsx

/**
 * CourseItem - Einzelne Kursanzeige mit Basisinformationen und Aktions-Buttons
 *
 * Props:
 * @param {object} course           - Kursobjekt mit folgenden erwarteten Feldern:
 *                                   - name (string): Kursname/Titel
 *                                   - date (string): Datum des Kurses (formatierte Anzeige)
 *                                   - time (string): Uhrzeit des Kurses (formatierte Anzeige)
 *                                   - room (string): Kursraum/Ort
 *                                   - trainer (string|null): Name des Trainers (optional)
 * @param {function} onEdit         - Callback-Funktion, wird aufgerufen mit dem Kursobjekt beim Klick auf "Bearbeiten"
 * @param {function} onDelete       - Callback-Funktion, wird aufgerufen mit der Kurs-ID beim Klick auf "Löschen"
 *
 * Verhalten:
 * - Zeigt Kursname, Datum + Uhrzeit, Raum und Trainername an
 * - Trainername zeigt "Kein Trainer angegeben" an, falls nicht vorhanden
 * - Zwei Aktionsbuttons rechts unten: Bearbeiten und Löschen mit Icons und Tooltip
 *
 * Beispiel:
 * <CourseItem
 *   course={{ id: 1, name: "Yoga", date: "2025-06-20", time: "18:00", room: "Raum A", trainer: "Anna" }}
 *   onEdit={(course) => openEditDialog(course)}
 *   onDelete={(id) => deleteCourse(id)}
 * />
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CourseItem = ({ course, onEdit, onDelete }) => {
  return (
    <Box sx={{ padding: 2, border: "1px solid #ddd", borderRadius: 2, marginBottom: 2 }}>
      <Typography variant="h6">{course.name}</Typography>
      <Typography variant="body2" color="text.secondary">{course.date} | {course.time}</Typography>
      <Typography variant="body2" color="text.secondary">{course.room}</Typography>
      <Typography variant="body2">{course.trainer || "Kein Trainer angegeben"}</Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 1 }}>
        <Tooltip title="Bearbeiten">
          <IconButton onClick={() => onEdit(course)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Löschen">
          <IconButton onClick={() => onDelete(course.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CourseItem;

