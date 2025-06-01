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

const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

const handleRatingSubmit = (course, rating) => {
  console.log(`Rating für ${course.name}: ${rating} Sterne`);
};

const Courses = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [ratingDialogCourse, setRatingDialogCourse] = useState(null);
  const [filterTimes, setFilterTimes] = useState([]);
  const [filterRooms, setFilterRooms] = useState([]);
  const [filterTrainers, setFilterTrainers] = useState([]);
  const [reviewsDialogCourse, setReviewsDialogCourse] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Wenn selectedDate nicht gesetzt oder ungültig ist, auf Montag setzen
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
      return; // Warte mit dem Laden der Kurse bis selectedDate gesetzt ist
    }

    // Kurse vom Backend laden
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/courses");
        let allCourses = [];

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

  if (!selectedDate || !isValid(selectedDate)) return null;

  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleCloseDialog = () => setSelectedCourse(null);
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfSelectedWeek, i);
    return {
      label: day.toLocaleDateString("de-DE", { weekday: "short" }),
      rawDate: format(day, "yyyy-MM-dd"),      // für Vergleiche
      displayDate: format(day, "dd.MM.yyyy"),  // für UI-Anzeige
    };
  });

  const getCoursesByDayAndSlot = (dayStr, slot) => {
    return courses
      .filter(course => {
        const date = new Date(course.start_time);
        if (!isValid(date)) return false;

        const courseDate = format(date, "yyyy-MM-dd");
        return courseDate === dayStr;
      })
      .filter(course => {
        const date = new Date(course.start_time);
        if (!isValid(date)) return false;

        const courseStartTime = format(date, "HH:mm");
        return courseStartTime >= slot.start && courseStartTime < slot.end;
      })
      .filter(course => {
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <WeekPicker
          selectedDate={selectedDate}
          onDateChange={(date) => {
            const monday = startOfWeek(new Date(date), { weekStartsOn: 1 });
            setSelectedDate(monday);
          }}
        />

        <Box>
          <IconButton onClick={() => setSelectedDate(prev => subWeeks(prev, 1))}><ArrowBack /></IconButton>
          <IconButton onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}><ArrowForward /></IconButton>
          <IconButton onClick={handleFilterClick}><FilterListIcon /></IconButton>
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

      {/* Header-Zeile */}
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

      {/* Zeilen für Zeitslots */}
      {timeSlots.map(slot => (
        <Box key={slot.label} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", mr: 1 }} />
            <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
              {slot.label}
            </Typography>
            <Box sx={{ flexGrow: 1, height: "1px", backgroundColor: "#ccc", ml: 1 }} />
          </Box>
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
                        <Typography variant="subtitle1" fontWeight="bold">{course.title}</Typography>
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
      <ReviewsDialog
        course={reviewsDialogCourse}
        open={Boolean(reviewsDialogCourse)}
        onClose={() => setReviewsDialogCourse(null)}
      />
    </Box>
  );
};

export default Courses;
