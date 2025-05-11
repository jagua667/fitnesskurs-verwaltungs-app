// src/components/CourseEditor.jsx (war: KursVerwaltung)
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

