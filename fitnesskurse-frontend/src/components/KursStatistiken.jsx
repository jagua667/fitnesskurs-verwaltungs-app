import React from 'react';
import { Box, Typography } from '@mui/material';

const KursStatistiken = ({ courses }) => {
  const totalCourses = courses.length;
  const averageRating = 4.2;  // Dummy-Bewertung, kann später dynamisch ermittelt werden

  return (
    <Box>
      <Typography variant="h6">Kursstatistiken</Typography>
      <Typography variant="body1">Gesamtzahl der Kurse: {totalCourses}</Typography>
      <Typography variant="body1">Durchschnittliche Bewertung: {averageRating} Sterne</Typography>
    </Box>
  );
};

export default KursStatistiken;

