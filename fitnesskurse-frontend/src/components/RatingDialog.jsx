/**
 * RatingDialog – Dialog zur Kursbewertung durch Nutzer
 *
 * Diese Komponente zeigt einen modalen Dialog, in dem Nutzer einen Kurs mit Sternen bewerten
 * und optional einen Kommentar hinterlassen können.
 *
 * Props:
 * - open (boolean): Steuert die Sichtbarkeit des Dialogs
 * - course (object): Der Kurs, der bewertet werden soll (muss mindestens ein `name`-Attribut besitzen)
 * - onClose (function): Wird beim Schließen des Dialogs aufgerufen
 * - onSubmit (function): Wird mit (course, review) aufgerufen, sobald der Nutzer eine Bewertung sendet
 *
 * Review-Format:
 * {
 *   stars: number,               // Bewertungssterne (1–5)
 *   comment: string,             // Optionaler Kommentar
 *   date: string (de-DE format)  // Datum der Bewertung
 * }
 *
 * Verhalten:
 * - Beim Öffnen wird der Zustand (Rating, Kommentar, Status) zurückgesetzt
 * - Nach erfolgreicher Bewertung wird eine Dankesnachricht angezeigt
 * - Der Absende-Button ist deaktiviert, solange keine Sterne ausgewählt wurden
 *
 * Hinweis:
 * - Die Komponente ist für die Verwendung innerhalb eines Kurskontextes gedacht
 * - `course` muss gesetzt sein – ansonsten wird `null` gerendert
 */

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
      stars: userRating,
      comment,
      date: new Date().toLocaleString("de-DE"),
    };

    onSubmit(course, review);
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
