import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from "@mui/material";
import { ArrowBack, ArrowForward, ViewList, CalendarViewWeek, Delete } from "@mui/icons-material";
import { startOfWeek, addDays, format, isValid, addWeeks, subWeeks } from "date-fns";
import RatingDialog from "../components/RateDialog";
import { differenceInWeeks } from "date-fns";
import { mockCourses } from "../mock/courses";

const currentUserEmail = "test@example.com";

//const canRateCourse = (course, currentUserEmail) => {
//const weeksSince = differenceInWeeks(new Date(), new Date(course.date));
//const hasBooked = course.bookedBy.includes(currentUserEmail);
//const hasRated = course.ratedBy.includes(currentUserEmail);
//return weeksSince >= 4 && hasBooked && !hasRated;
//};
const canRateCourse = (course, currentUserEmail) => {
  const hasBooked = course.bookedBy.includes(currentUserEmail);
  const hasRated = course.ratedBy.includes(currentUserEmail);
  return hasBooked && !hasRated;
};

const handleRatingSubmit = (course, rating) => {
  console.log(`Rating für ${course.name}: ${rating} Sterne`);
  // Hier ggf. Backend-Aufruf oder Statusaktualisierung
};

const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

const MyBookings = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [bookings, setBookings] = useState(mockCourses);
  const [ratingDialogCourse, setRatingDialogCourse] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
      return;
    }

    const generateRecurringBookings = (bookings, startOfWeekDate) => {
      const recurringBookings = [];

      bookings.forEach((booking) => {
        if (booking.repeat && booking.repeat.interval === "weekly") {
          const dayOfWeek = booking.repeat.dayOfWeek;
          const recurringDate = addDays(startOfWeekDate, dayOfWeek - 1); // Montag = 1
          const dateStr = format(recurringDate, "yyyy-MM-dd");

          // Nur wenn der Kurs zu diesem Datum noch nicht existiert
          if (!recurringBookings.some(b => b.name === booking.name && b.date === dateStr)) {
            recurringBookings.push({
              ...booking,
              date: dateStr,
            });
          }
        } else {
          // Einmalige Kurse, wie gehabt
          const bookingDate = new Date(booking.date);
          const weekStart = new Date(startOfWeekDate);
          const weekEnd = addDays(weekStart, 6);

          if (bookingDate >= weekStart && bookingDate <= weekEnd) {
            recurringBookings.push(booking);
          }
        }
      });

      return recurringBookings;
    };


    const recurringBookings = generateRecurringBookings(mockCourses, selectedDate);
    setBookings(recurringBookings);
  }, [selectedDate]);

  if (!selectedDate || !isValid(selectedDate)) return null;

  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfSelectedWeek, i);
    return {
      label: day.toLocaleDateString("de-DE", { weekday: "short" }),
      rawDate: format(day, "yyyy-MM-dd"),
      displayDate: format(day, "dd.MM.yyyy"),
      fullDate: day,
    };
  });

  const getBookingsByDayAndSlot = (dayStr, slot) => {
    return bookings
      .filter(b => b.date === dayStr)
      .filter(b => {
        const [start] = b.time.split(" - ");
        return start >= slot.start && start < slot.end;
      })
      .sort((a, b) => {
        const aStart = a.time.split(" - ")[0];
        const bStart = b.time.split(" - ")[0];
        return aStart === bStart
          ? a.name.localeCompare(b.name)
          : aStart.localeCompare(bStart);
      });
  };

  const handleCancel = (bookingId) => {
    setBookingToCancel(bookingId);
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    setBookings(bookings.filter(booking => booking.id !== bookingToCancel));
    setOpenCancelDialog(false);
    setBookingToCancel(null);
  };

  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
    setBookingToCancel(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Meine Buchungen</Typography>

      {/* Ansicht-Umschaltung */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newValue) => newValue && setViewMode(newValue)}
          size="small"
        >
          <ToggleButton value="calendar"><CalendarViewWeek fontSize="small" /> Kalender</ToggleButton>
          <ToggleButton value="list"><ViewList fontSize="small" /> Kurse verwalten</ToggleButton>
        </ToggleButtonGroup>
        <Box>
          <IconButton onClick={() => setSelectedDate(prev => subWeeks(prev, 1))}><ArrowBack /></IconButton>
          <IconButton onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}><ArrowForward /></IconButton>
        </Box>
      </Box>

      {viewMode === "calendar" && (
        <>
          {/* Wochentage */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            mb: 1,
          }}>
            {weekDays.map((day) => (
              <Box key={day.rawDate} className="calendar-day-label">
                {day.label}<br />{day.displayDate}
              </Box>
            ))}
          </Box>

          {/* Kalenderansicht */}
          {timeSlots.map(slot => (
            <Box key={slot.label} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", mr: 1 }} />
                <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                  {slot.label}
                </Typography>
                <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", ml: 1 }} />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                {weekDays.map(day => {
                  const bookingsForDay = getBookingsByDayAndSlot(day.rawDate, slot); // 🔧 FIX!
                  return (
                    <Box key={day.rawDate} sx={{ minHeight: "80px" }}>
                      {bookingsForDay.map(booking => (
                        <Paper
                          key={booking.id}
                          sx={{ p: 1, mb: 1, backgroundColor: "#e3f2fd" }}
                        >
                          <Typography variant="subtitle2">{booking.name}</Typography>
                          {booking.rating !== undefined && (
                            <Rating value={booking.rating} precision={0.1} readOnly size="small" />
                          )}
                          <Typography variant="body2">{booking.time}</Typography>
                          <Typography variant="body2">{booking.trainer}</Typography>
                          <Typography variant="body2">{booking.room}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}

        </>
      )}
      {viewMode === "list" && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Hier können Sie Ihre Kurse verwalten und stornieren.
          </Typography>
          {bookings
            .filter(b => {
              const bookingDate = new Date(b.date);
              const start = startOfSelectedWeek;
              const end = addDays(start, 6);
              return bookingDate >= start && bookingDate <= end;
            })
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .map(booking => (
              <Paper key={booking.id} sx={{ p: 2, mb: 2, backgroundColor: "#e3f2fd" }}>
                <Typography variant="subtitle1">{booking.name}</Typography>
                {booking.rating !== undefined && (
                  <Rating value={booking.rating} precision={0.1} readOnly size="small" />
                )}
                <Typography variant="body2">
                  {format(new Date(booking.date), "dd.MM.yyyy")} – {booking.time}
                </Typography>
                <Typography variant="body2">Trainer: {booking.trainer}</Typography>
                <Typography variant="body2">Raum: {booking.room}</Typography>

                <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleCancel(booking.id)}
                  >
                    Stornieren
                  </Button>
                  {canRateCourse(booking, currentUserEmail) && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setRatingDialogCourse(booking)}
                    >
                      Kurs bewerten
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}
        </Box>
      )}

      {/* Stornierungsbestätigung Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseDialog}>
        <DialogTitle>Bestätigung der Stornierung</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Möchten Sie diese Buchung wirklich stornieren?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Abbrechen
          </Button>
          <Button onClick={confirmCancel} color="error">
            Stornieren
          </Button>
        </DialogActions>
      </Dialog>

      <RatingDialog
        open={!!ratingDialogCourse}
        course={ratingDialogCourse}
        onClose={() => setRatingDialogCourse(null)}
        onSubmit={handleRatingSubmit}
      />
    </Box>
  );
};

export default MyBookings;

