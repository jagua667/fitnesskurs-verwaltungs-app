import React from 'react';
import { Box, Button } from '@mui/material';
import KursItem from './KursItem';  // Zeigt einzelne Kurse an

const KursVerwaltung = ({ courses, onEdit, onDelete }) => {
  return (
    <Box>
      {courses.map(course => (
        <KursItem
          key={course.id}
          kurs={course}
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

export default KursVerwaltung;

