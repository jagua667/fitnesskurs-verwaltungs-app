// components/CourseDialog.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import RoomIcon from '@mui/icons-material/Room';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const CourseDialog = ({ course, onClose }) => {
  if (!course) return null;

  const formattedDate = new Date(course.date).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Dialog open={Boolean(course)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h5" gutterBottom>{course.name}</Typography>

        <Box display="flex" alignItems="center" mt={2}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>
            {formattedDate}, {course.time || "17:00 - 17:50"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={1}>
          <RoomIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>FitNow Böblingen, {course.room || "Kursraum"}</Typography>
        </Box>

        <Box mt={3} mb={2}>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            {course.description}
          </Typography>
        </Box>

        <hr />

        <Box mt={2}>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Kontakt:
          </Typography>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              padding: 2,
              mt: 1,
              boxShadow: 1,
            }}
          >
            <Typography>📍 FitNow Böblingen</Typography>
            <Typography>Böblinger Straße 123</Typography>
            <Typography>71032 Böblingen</Typography>
            <Typography>📞 07031 123456</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
        <Button variant="contained" color="primary" onClick={() => alert("Online gebucht!")}>
          Online buchen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;

