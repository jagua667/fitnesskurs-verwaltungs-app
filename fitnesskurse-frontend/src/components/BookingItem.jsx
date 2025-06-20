/**
 * BookingItem Komponente
 * 
 * Zeigt eine einzelne Kursbuchung an mit:
 * - Kursname, Datum, Uhrzeit und Ort
 * - Feste Bewertung (4 Sterne als Platzhalter)
 * - Button "Stornieren" für zukünftige Buchungen (isPast === false)
 * - Button "Kurs bewerten" für vergangene Buchungen (isPast === true)
 * 
 * Props:
 * - booking: Objekt mit Buchungsdaten (course, date, time, location, id)
 * - onCancel: Callback, wird aufgerufen mit booking.id beim Stornieren
 * - isPast: Boolean, zeigt an ob der Kurs bereits vorbei ist
 * - onRate: Callback, wird aufgerufen mit booking, um Bewertung zu starten
 * 
 * Enthält auch renderStars Funktion, um Sterne-SVGs dynamisch zu rendern.
 */

import React from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Button, // Für den Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) =>
    i < rating ? <StarIcon key={i} fontSize="small" sx={{ color: 'gold' }} /> : <StarBorderIcon key={i} fontSize="small" sx={{ color: 'gold' }} />
  );
};

const BookingItem = ({ booking, onCancel, isPast, onRate }) => {
  if (!booking) return null;

  return (
    <ListItem
      sx={{
        bgcolor: 'grey.50',
        borderRadius: 1,
        mb: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <ListItemText
        primary={
          <Typography variant="subtitle1" fontWeight="bold">
            {booking.course}
          </Typography>
        }
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 0.5, fontSize: 'inherit', verticalAlign: 'middle' }} />
              {booking.date} • {booking.time}
            </Typography>

            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 0.5, fontSize: 'inherit', verticalAlign: 'middle' }} />
              {booking.location}
            </Typography>

            <Box mt={0.5}>
              <Typography variant="body2" color="text.secondary" component="div">
                4,0 {renderStars(4)} (35) {/* Platzhalter: 4 Sterne */}
              </Typography>
            </Box>
            
            {/* Entfernen der "Bestätigt"-Anzeige */}
            {!isPast && (
              <Box mt={1}>
                {/* Statt der "Bestätigt"-Anzeige, Button zum Stornieren */}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onCancel(booking.id)}
                >
                  Stornieren
                </Button>
              </Box>
            )}
            {isPast && (
              <Box mt={1}>
                <button
                  onClick={() => onRate(booking)}
                  style={{ background: '#eee', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                >
                  Kurs bewerten
                </button>
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export default BookingItem;

