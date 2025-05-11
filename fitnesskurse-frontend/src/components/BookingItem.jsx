import React from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Box,
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
      secondaryAction={
        !isPast && (
          <Tooltip title="Stornieren">
            <IconButton
              edge="end"
              aria-label="stornieren"
              onClick={() => onCancel(booking.id, booking.course)}
              sx={{ color: 'error.main', fontSize: '2rem' }}
            >
              <DeleteIcon sx={{ fontSize: 'inherit' }} />
            </IconButton>
          </Tooltip>
        )
      }
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
              {booking.date} • {booking.zeit}
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
            {!isPast && (
              <Box mt={1}>
                <Chip label={booking.status} color="success" size="small" />
              </Box>
            )}
            {isPast && (
              <Box mt={1}>
                <button onClick={() => onRate(booking)} style={{ background: '#eee', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>
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

