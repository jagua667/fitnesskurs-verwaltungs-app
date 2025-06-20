import React, { useState, useEffect } from "react";
import { expandRecurringCourses, mapCourse } from "../utils/courseHelpers";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  Paper,
  Rating,
  Tooltip,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { startOfWeek, addDays, format, isValid, addWeeks, subWeeks, parseISO } from "date-fns";
import { Button } from '@mui/material';
import CourseDialog from "../components/CourseDialog";
import WeekPicker from "../components/WeekPicker";
import CourseFilter from "../components/CourseFilter";
import ReviewsDialog from "../components/ReviewsDialog";
import axios from "axios";

// Zeitfenster zur Gruppierung der Kurse
const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

// Beispiel-Funktion zum Verarbeiten von Bewertungen (hier nur Logging)
const handleRatingSubmit = (course, rating) => {
  console.log(`Rating für ${course.name}: ${rating} Sterne`);
};

const Courses = () => {
  // State-Variablen zur Steuerung der UI und Filter
  const [selectedDate, setSelectedDate] = useState(null);  // Ausgewähltes Datum (Wochenstart)
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);  // Element für Filter-Menü
  const [selectedCourse, setSelectedCourse] = useState(null);  // Ausgewählter Kurs für Detaildialog
  const [ratingDialogCourse, setRatingDialogCourse] = useState(null); // Kurs für Bewertungsdialog (nicht genutzt hier)
  const [filterTimes, setFilterTimes] = useState([]); // Zeitfilter (z.B. Vormittag, Nachmittag)
  const [filterRooms, setFilterRooms] = useState([]); // Raumfilter
  const [filterTrainers, setFilterTrainers] = useState([]); // Trainerfilter
  const [reviewsDialogCourse, setReviewsDialogCourse] = useState(null); // Kurs für Bewertungen-Dialog
  const [courses, setCourses] = useState([]);  // Geladene Kursdaten

  // useEffect zum Laden der Kurse, wenn sich das ausgewählte Datum ändert
  useEffect(() => {
    // Falls kein Datum gesetzt oder ungültig, auf den Montag der aktuellen Woche setzen
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
      return;  // Warten bis Datum gesetzt ist, bevor Kurse geladen werden
    }

    // Asynchrone Funktion zum Abrufen der Kurse vom Backend
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/courses");
        let allCourses = [];

        // Für jeden Kurs aus dem Backend: ggf. wiederkehrende Termine auflösen
        response.data.forEach(course => {
          console.log("Original backend course:", course);
          const expanded = expandRecurringCourses(course);
          allCourses.push(...expanded);
        });

        setCourses(allCourses);
      } catch (error) {
        console.error("Fehler beim Laden der Kurse:", error);
      }
    };

    fetchCourses();
  }, [selectedDate]);

  // Falls ausgewähltes Datum noch nicht valide ist, nichts rendern
  if (!selectedDate || !isValid(selectedDate)) return null;

  // Eventhandler für Klick auf Kurs: öffnet Detaildialog
  const handleCourseClick = (course) => setSelectedCourse(course);

  // Schließt den Detaildialog
  const handleCloseDialog = () => setSelectedCourse(null);

  // Öffnet das Filtermenü
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);

  // Schließt das Filtermenü
  const handleFilterClose = () => setFilterAnchorEl(null);

  // Berechnet den Wochenanfang (Montag) der aktuell ausgewählten Woche
  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

  // Erzeugt eine Liste mit allen Tagen der Woche für die Anzeige
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfSelectedWeek, i);
    return {
      label: day.toLocaleDateString("de-DE", { weekday: "short" }), // z.B. "Mo", "Di"
      rawDate: format(day, "yyyy-MM-dd"),  // Datumsformat für Vergleiche
      displayDate: format(day, "dd.MM.yyyy"),   // Datumsanzeige für UI
    };
  });

   /**
   * Filtert und sortiert Kurse für einen bestimmten Tag und Zeitslot
   * Berücksichtigt auch aktive Filter für Zeit, Raum und Trainer
   * @param {string} dayStr - Datum als String "yyyy-MM-dd"
   * @param {object} slot - Zeitfenster {label, start, end}
   * @returns {Array} Gefilterte und sortierte Kurse
   */
  const getCoursesByDayAndSlot = (dayStr, slot) => {
    return courses
      .filter(course => {
        // Kursdatum validieren und filtern nach dem gegebenen Tag
        const date = new Date(course.start_time);
        if (!isValid(date)) return false;

        const courseDate = format(date, "yyyy-MM-dd");
        return courseDate === dayStr;
      })
      .filter(course => {
        // Filtern nach Zeitfenster (Zeitslot)
        const date = new Date(course.start_time);
        if (!isValid(date)) return false;

        const courseStartTime = format(date, "HH:mm");
        return courseStartTime >= slot.start && courseStartTime < slot.end;
      })
      .filter(course => {
        // Weitere Filter: nach ausgewählten Zeiten, Räumen und Trainern
        const date = new Date(course.start_time);
        if (!isValid(date)) return false;

        const courseStartTime = format(date, "HH:mm");

        const matchesTime = filterTimes.length > 0
          ? filterTimes.some(label => {
            const slotObj = timeSlots.find(s => s.label === label);
            if (!slotObj) return false;
            return courseStartTime >= slotObj.start && courseStartTime < slotObj.end;
          })
          : true;

        const matchesRoom = filterRooms.length > 0
          ? filterRooms.includes(course.location ?? "")
          : true;

        const matchesTrainer = filterTrainers.length > 0
          ? filterTrainers.includes(course.trainer_id ?? "")
          : true;

        return matchesTime && matchesRoom && matchesTrainer;
      })
      .sort((a, b) => {
        // Sortieren der Kurse zuerst nach Startzeit, dann nach Titel alphabetisch
        const aDate = new Date(a.start_time);
        const bDate = new Date(b.start_time);
        if (!isValid(aDate) || !isValid(bDate)) return 0;

        const aTime = format(aDate, "HH:mm");
        const bTime = format(bDate, "HH:mm");

        if (aTime === bTime) {
          return (a.title || '').localeCompare(b.title || '');
        }
        return aTime.localeCompare(bTime);
      });
  };

  return (
    
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Kurskalender</Typography>

     {/* Kopfbereich mit Wochenauswahl und Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <WeekPicker
          selectedDate={selectedDate}
          onDateChange={(date) => {
            // Bei Änderung: Datum auf Montag der gewählten Woche setzen
            const monday = startOfWeek(new Date(date), { weekStartsOn: 1 });
            setSelectedDate(monday);
          }}
        />

        <Box>
          {/* Buttons für Wochen-Navigation */}
          <IconButton onClick={() => setSelectedDate(prev => subWeeks(prev, 1))}><ArrowBack /></IconButton>
          <IconButton onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}><ArrowForward /></IconButton>

          {/* Button zum Öffnen des Filtermenüs */}
          <IconButton onClick={handleFilterClick}><FilterListIcon /></IconButton>

          {/* Filtermenü mit mehreren Filteroptionen */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <CourseFilter
              filterTimes={filterTimes}
              filterRooms={filterRooms}
              filterTrainers={filterTrainers}
              setFilterTimes={setFilterTimes}
              setFilterRooms={setFilterRooms}
              setFilterTrainers={setFilterTrainers}
              onApply={handleFilterClose}
              onClose={handleFilterClose}
            />
          </Menu>
        </Box>
      </Box>

      {/* Header-Zeile mit Wochentagen und Datum */}
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

      {/* Zeilen für jeden Zeitslot mit Kursen */}
      {timeSlots.map(slot => (
        <Box key={slot.label} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", mr: 1 }} />
            <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
              {slot.label}
            </Typography>
            <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", ml: 1 }} />
          </Box>

          {/* Kursfelder pro Tag */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
            }}
          >
            {weekDays.map(day => {
              const courses = getCoursesByDayAndSlot(day.rawDate, slot);
              return (
                <Box key={day.rawDate} sx={{ minHeight: "80px" }}>
                  {courses.map(course => (
                    <Tooltip key={course.id} title="Online buchen" arrow>
                      <Paper

                        onClick={() => handleCourseClick(course)}
                        sx={{
                          p: 1,
                          mb: 1,
                          cursor: "pointer",
                          backgroundColor: course.location === 'Fitnow Tübingen' ? '#c8e6c9' :
                            course.location === 'Fitnow Berlin_Lichtenberg' ? '#bbdefb' :
                              '#ffe0b2',
                          transition: "background-color 0.3s",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                          },
                        }}
                      >
                       {/* Kursname */}
                        <Typography variant="subtitle1" fontWeight="bold">{course.title}</Typography>

                        {/* Bewertungsanzeige (Sterne und Anzahl) */}
                        {course.rating !== null && course.rating !== undefined ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Rating
                              name={`rating-${course.id}`}
                              value={Number(course.rating)}
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({course.rating_count || 0})
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Bewertung: Noch keine Bewertung
                          </Typography>
                        )}

                        {/* Informationen zu Trainer und Ort */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
                              Trainer:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.trainer_name}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
                              Ort:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.location}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Kurszeiten */}
                        <Typography variant="body2" color="text.secondary">
                          {format(parseISO(course.start_time), "HH:mm")} – {format(parseISO(course.end_time), "HH:mm")}
                        </Typography>


                      </Paper>
                    </Tooltip>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      {/* Dialog zur Kursdetailanzeige und Bewertung */}
      <CourseDialog
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onShowReviews={(course) => setReviewsDialogCourse(course)}
        onSubmitRating={(courseId, review) => {
          setCourses(prev =>
            prev.map(course => {
              if (course.id === courseId) {
                return {
                  ...course,
                  reviews: [...(course.reviews || []), review],
                  ratedBy: [...(course.ratedBy || []), review.user]
                };
              }
              return course;
            })
          );
        }}
      />

      {/* Dialog für die Anzeige von Bewertungen */}
      <ReviewsDialog
        course={reviewsDialogCourse}
        open={Boolean(reviewsDialogCourse)}
        onClose={() => setReviewsDialogCourse(null)}
      />
    </Box>
  );
};

export default Courses;
