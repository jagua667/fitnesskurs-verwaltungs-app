import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  Link,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const CourseDialog = ({ course, onClose, onSubmitRating, onShowReviews }) => {
  if (!course) return null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);


  const studioName = course.studio || "FitNow Böblingen";
  const room = course.room || "Kursraum";
  const addressStreet = course.address ? course.address.split(",")[0] : "Hauptstraße 12";
  const addressCity = course.address ? course.address.split(",")[1]?.trim() : "12345 Böblingen";
  const fullAddress = `${addressStreet}\n${addressCity}`;

  const mapsQuery = encodeURIComponent(course.address || `${addressStreet}, ${addressCity}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log(`googleMapsApiKey: ${googleMapsApiKey}`);

  console.log("course.start_time: ", course.start_time);
  console.log("course.end_time: ", course.end_time);
    const formattedDate = course.start_time
      ? new Date(course.start_time).toLocaleDateString("de-DE", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Datum nicht verfügbar";
    const timeRange = course.start_time && course.end_time
      ? `${new Date(course.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(course.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
      : course.time || "Uhrzeit nicht verfügbar";

  const handleSubmit = () => {
    if (!course || rating === 0) return;

    const review = {
      user: "Max Mustermann", // später dynamisch ersetzen
      stars: rating,
      comment,
      date: new Date().toLocaleString("de-DE"),
    };

    onSubmitRating(course.id, review);
    setSubmitted(true);
  };

    const handleBooking = async () => {
      setIsBooking(true);
      try {
        const token = localStorage.getItem("token"); // oder wie du den Token speicherst
        if (!token) {
          alert("Bitte zuerst einloggen, um zu buchen.");
          return;
        }

        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Buchung fehlgeschlagen.");
        }

        alert("🎉 Buchung erfolgreich!");
        onClose(); // optional: Dialog schließen
      } catch (err) {
        alert("❌ Fehler bei der Buchung: " + err.message);
      }
      setIsBooking(false);
    };

  return (
    <Dialog open={Boolean(course)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h5" gutterBottom>
          {course.name}
        </Typography>

        {course.rating !== undefined && (
          <Box display="flex" alignItems="center" gap={1} mt={1} mb={1}>
            <Rating value={course.rating} precision={0.1} readOnly size="small" />
            <Typography
              variant="body2"
              sx={{
                cursor: course.reviews?.length ? "pointer" : "default",
                textDecoration: course.reviews?.length ? "underline" : "none",
                color: course.reviews?.length ? "primary.main" : "text.secondary",
              }}
              onClick={() => {
                  if ((course.rating_count > 0) && onShowReviews) {
                    onShowReviews(course);
                  }
              }}
            >
              {course.rating_count || 0} Bewertung{course.rating_count === 1 ? "" : "en"}
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" mt={2} mb={2}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>
              {formattedDate}, {timeRange}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            bgcolor: "#f0f4f8",
            borderLeft: "4px solid #1976d2",
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" sx={{ fontStyle: "italic" }}>
            {course.description || "Keine Beschreibung verfügbar."}
          </Typography>
        </Box>

        <Box
          mt={3}
          p={2}
          sx={{
            bgcolor: "#e3f2fd",
            borderRadius: 2,
            boxShadow: "0 1px 5px rgba(25, 118, 210, 0.2)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <RoomIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              {studioName}
            </Typography>
          </Box>

          <Typography variant="body2" mb={1}>Raum: {room}</Typography>

          {/*
          <Box>
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ whiteSpace: "pre-line" }} // sorgt dafür, dass \n als Zeilenumbruch dargestellt wird
            >
              {fullAddress}
            </Link>
          </Box>
          
          <Box mt={2} sx={{ width: "100%", height: 200, borderRadius: 1, overflow: "hidden" }}>
            <iframe
              title="Kursort Karte"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${mapsQuery}`}
              allowFullScreen
            />
          </Box>
          */}
          {/* Platzhalter anstatt der eingebetteten Google Maps, da Google Maps Karten API ab einem bestimmten Nutzungspunkt kostenpflichtig ist */}
            <Box>{fullAddress}</Box>
            <Box
              mt={2}
              sx={{
                width: "100%",
                height: 200,
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "#ccc", // fallback
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/map-placeholder.png"
                alt="Kartenplatzhalter"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
        <Button variant="contained" color="primary" onClick={handleBooking} disabled={isBooking}>
           {isBooking ? "Wird gebucht..." : "Online buchen"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;
