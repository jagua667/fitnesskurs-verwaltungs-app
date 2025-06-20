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
import RatingDialog from "../components/RatingDialog";
import { differenceInWeeks } from "date-fns";
import axios from "axios";

// Hilfsfunktion: Liefert die E-Mail des aktuellen Nutzers
const currentUserEmail = (course) => course.user_email;

// Hilfsfunktion: Bestimmt, ob ein Kurs bewertbar ist (z.B. nach 4 Wochen)
const canRateCourse = (course) => {
  const weeksSince = differenceInWeeks(new Date(), new Date(course.booking_date));
  return weeksSince >= 4 && !course.user_has_rated;
};

// Zeitslots zur Darstellung der Kalenderansicht
const timeSlots = [
  { label: "Vormittag", start: "06:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

const MyBookings = () => {
  // Zustand für ausgewähltes Datum und Ansicht
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");

  // Zustand für Buchungen und Bewertung/Abbrechen-Dialoge
  const [bookings, setBookings] = useState([]);
  const [ratingDialogCourse, setRatingDialogCourse] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Lädt Buchungen beim Start oder wenn das Datum geändert wird
  useEffect(() => {
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
      return;
    }

    fetchBookings();
  }, [selectedDate]);

  // Funktion zum Absenden einer Bewertung
  const handleRatingSubmit = async (course, review) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Kurs-ID für Bewertung:", course);

      const course_id = course.course_id ?? course.id;

      if (!course_id) {
        console.error("❌ Keine gültige Kurs-ID gefunden für:", course);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/ratings",
        {
          course_id: course_id, // 
          user_id: course.user_id, // muss im course-Objekt sein oder separat geholt werden
          rating: review.stars,
          comment: review.comment || "", // falls Kommentar optional
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Bewertung gespeichert:", response.data);

      // Dialog schließen und Buchungen neu laden
      setRatingDialogCourse(null);
      await fetchBookings(); // nach oben auslagern und aufrufbar machen
    } catch (error) {
      console.error("Fehler beim Speichern der Bewertung:", error);
    }
  };

  // Funktion zum Laden der Buchungen vom Server
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/bookings/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
        //withCredentials: true, // um Cookies mitzuschicken, falls benötigt
      });

      const data = response.data;
      console.log("response.data: ", response.data);

      // Wiederholende Buchungen verarbeiten
      const generateRecurringBookings = (bookings, startOfWeekDate) => {
        const recurringBookings = [];

        bookings.forEach((booking) => {
          const repeatUntil = new Date(booking.repeat_until);
          const originalBookingDate = new Date(booking.date);
          const dayOfWeek = (originalBookingDate.getDay() + 6) % 7; // 0 = Mo, ..., 6 = So

          if (booking.repeat === "weekly") {
            const recurringDate = addDays(startOfWeekDate, dayOfWeek);
            if (recurringDate <= repeatUntil) {
              const dateStr = format(recurringDate, "yyyy-MM-dd");
              if (!recurringBookings.some(b => b.name === booking.name && b.date === dateStr)) {
                recurringBookings.push({
                  ...booking,
                  date: dateStr,
                });
              }
            }
          } else {
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


      const recurringBookings = generateRecurringBookings(data, selectedDate);
      setBookings(recurringBookings);

    } catch (err) {
      console.error("Fehler beim Laden der Buchungen:", err);
    }
  };

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

  // Filtert Buchungen nach Wochentag und Zeitslot
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

  // Öffnet Dialog zum Stornieren einer Buchung
  const handleCancel = (bookingId) => {
    setBookingToCancel(bookingId);
    setOpenCancelDialog(true);
  };

  // Bestätigt und löscht Buchung
  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/bookings/${bookingToCancel}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(bookings.filter(booking => booking.id !== bookingToCancel));
      setOpenCancelDialog(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error("Fehler beim Stornieren der Buchung:", error);
    }
  };

  // Schließt Dialog
  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
    setBookingToCancel(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Meine Buchungen</Typography>

      {/* Auswahl: Kalenderansicht oder Listenansicht */}
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

      {/* Kalenderansicht */}
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

          {/* Buchungen je Slot und Tag */}
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

      {/* Listenansicht zur Verwaltung */}
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

      {/* Dialog zur Buchungsstornierung */}
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

      {/* Dialog zur Kursbewertung */}
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
