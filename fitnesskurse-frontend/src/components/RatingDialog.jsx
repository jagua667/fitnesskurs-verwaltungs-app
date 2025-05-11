import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const RatingDialog = ({ open, onClose, course }) => {
  const [rating, setRating] = useState(0);

  const handleRating = () => {
    console.log(`Kurs ${course.course} mit ${rating} Sternen bewertet.`);
    onClose(); // später: API-Aufruf + Snackbar
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Kurs bewerten: {course?.course}</DialogTitle>
      <DialogContent>
        <Typography>Wie viele Sterne gibst du dem Kurs?</Typography>
        <Box mt={2} display="flex" gap={1}>
          {[1, 2, 3, 4, 5].map((value) => (
            <StarIcon
              key={value}
              fontSize="large"
              onClick={() => setRating(value)}
              sx={{ cursor: 'pointer', color: value <= rating ? 'gold' : 'grey.400' }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleRating} disabled={rating === 0}>Bewerten</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;

