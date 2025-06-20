/**
 * CourseStatistics - Zeigt einfache Statistiken zu Kursen an
 *
 * Props:
 * @param {Array} courses - Array von Kursobjekten
 *
 * Anzeige:
 * - Gesamtanzahl der Kurse (Länge des Arrays)
 * - Durchschnittliche Bewertung (aktuell als fester Wert 4.2, später dynamisch ermittelbar)
 *
 * Beispiel:
 * <CourseStatistics courses={courseList} />
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

const CourseStatistics = ({ courses }) => {
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

export default CourseStatistics;

