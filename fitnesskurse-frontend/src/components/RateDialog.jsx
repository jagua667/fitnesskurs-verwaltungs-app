import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const RatingDialog = ({ open, course, onClose, onSubmit }) => {
  const [userRating, setUserRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setUserRating(null);
      setComment("");
      setSubmitted(false);
    }
  }, [open]);

  if (!course) return null;

  const handleSubmit = () => {
    if (userRating === null) return;

    const review = {
      user: "Max Mustermann", // ggf. dynamisch
      stars: userRating,
      comment,
      date: new Date().toLocaleString("de-DE"),
    };

    onSubmit(course.id, review);
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Kurs bewerten: {course.name}
        </Typography>

        {submitted ? (
          <Typography sx={{ mt: 2, color: "green" }}>
            Danke für deine Bewertung!
          </Typography>
        ) : (
          <>
            <Rating
              name="user-course-rating"
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
            />
            <TextField
              label="Kommentar (optional)"
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        {!submitted && (
          <Button
            variant="contained"
            disabled={userRating === null}
            onClick={handleSubmit}
          >
            Bewertung senden
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
