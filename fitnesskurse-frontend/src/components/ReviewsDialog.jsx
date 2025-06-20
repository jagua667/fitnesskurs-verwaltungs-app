/**
 * ReviewsDialog – Dialog zur Anzeige von Kursbewertungen
 *
 * Diese Komponente zeigt in einem modalen Dialog alle Bewertungen zu einem bestimmten Kurs an.
 * Die Bewertungen werden dabei nach Datum absteigend sortiert dargestellt.
 *
 * Props:
 * - course (Object): Das Kursobjekt, das die Bewertungen enthält (course.reviews).
 * - open (boolean): Steuert, ob der Dialog sichtbar ist.
 * - onClose (Function): Callback-Funktion, die beim Schließen des Dialogs aufgerufen wird.
 *
 * Verhalten:
 * - Wenn keine Bewertungen vorhanden sind, wird ein Hinweistext angezeigt.
 * - Ansonsten werden die Bewertungen mit Nutzername, Datum, Sternebewertung und Kommentar
 *   jeweils in einem eingerahmten Abschnitt dargestellt.
 *
 * UI-Komponenten:
 * - MUI Dialog, DialogTitle, DialogContent, DialogActions
 * - MUI Rating zur Anzeige der Sterne
 * - MUI Typography und Box für Struktur und Layout
 *
 * Hinweise:
 * - Bewertungen werden clientseitig nach Datum sortiert (neueste zuerst).
 * - Die Sternebewertung ist readOnly, da es sich nur um eine Anzeige handelt.
 */

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Rating } from "@mui/material";

const ReviewsDialog = ({ course, open, onClose }) => {
  if (!course) return null;

  const sortedReviews = [...(course.reviews || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bewertungen zu {course.name}</DialogTitle>
      <DialogContent dividers>
        {sortedReviews.length === 0 && (
          <Typography>Keine Bewertungen vorhanden.</Typography>
        )}
        {sortedReviews.map((review, index) => (
          <Box key={index} mb={2} p={1} border={1} borderColor="grey.300" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="subtitle2">{review.user}</Typography>
              <Typography variant="caption">{new Date(review.date).toLocaleDateString("de-DE")}</Typography>
            </Box>
            <Rating value={review.stars} readOnly size="small" precision={0.5} />
            <Typography variant="body2" mt={1}>{review.comment}</Typography>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewsDialog;
