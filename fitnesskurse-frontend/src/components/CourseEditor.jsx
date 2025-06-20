// src/components/CourseEditor.jsx (war: KursVerwaltung)

/**
 * CourseEditor Komponente
 * 
 * Verwaltungsliste für Kurse mit Möglichkeiten zum Bearbeiten, Löschen und Erstellen.
 * 
 * Funktion:
 * - Zeigt eine Liste von Kursen an, jeweils als `CourseItem`
 * - Erlaubt das Bearbeiten eines bestehenden Kurses über `onEdit(course)`
 * - Erlaubt das Löschen eines Kurses über `onDelete(course)`
 * - Bietet einen Button zum Erstellen eines neuen Kurses (über `onEdit(null)`)
 * 
 * Props:
 * - courses: Array von Kursobjekten, die angezeigt werden sollen
 * - onEdit: Callback-Funktion, die beim Bearbeiten oder Erstellen aufgerufen wird, mit dem Kursobjekt oder null für neuen Kurs
 * - onDelete: Callback-Funktion, die beim Löschen eines Kurses aufgerufen wird
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import CourseItem from './CourseItem';  // Zeigt einzelne Kurse an

const CourseEditor = ({ courses, onEdit, onDelete }) => {
  return (
    <Box>
      {courses.map(course => (
        <CourseItem
          key={course.id}
          course={course}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <Button
        variant="contained"
        onClick={() => onEdit(null)}  // Öffnet das Formular zum Erstellen eines neuen Kurses
        sx={{ mt: 2 }}
      >
        Neuen Kurs erstellen
      </Button>
    </Box>
  );
};

export default CourseEditor;

