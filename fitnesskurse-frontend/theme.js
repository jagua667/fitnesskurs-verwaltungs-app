// src/theme.js

/**
 * Material-UI Theme-Konfiguration für die App.
 *
 * - Typography: Definiert die Standardschriftfamilie (Roboto und Fallbacks).
 * - Palette: Legt den Farbmodus ('light' oder 'dark') sowie
 *   Primär- und Sekundärfarben fest.
 *
 * Dieses Theme wird in der App verwendet, um ein konsistentes
 * Design und Styling zu gewährleisten.
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
  palette: {
    mode: 'light', // oder 'dark'
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

export default theme;

