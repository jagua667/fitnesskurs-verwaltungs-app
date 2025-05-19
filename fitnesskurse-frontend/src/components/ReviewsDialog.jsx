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
