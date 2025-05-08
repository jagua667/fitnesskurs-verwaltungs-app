import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Menu,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Layout from "../components/Layout";
import { mockCourses, mappedEvents } from '../mock/courses';
import CourseDialog from "../components/CourseDialog";
import WeekPicker from "../components/WeekPicker";
import CourseFilter from "../components/CourseFilter";
import CourseCard from "../components/CourseCard";
import { startOfWeek, addDays, format, isValid } from "date-fns";

const Kurse = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterTimes, setFilterTimes] = useState([]);
  const [filterRooms, setFilterRooms] = useState([]);
  const [filterTrainers, setFilterTrainers] = useState([]);


  // Initialisiere Datum auf Wochenstart
  useEffect(() => {
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
    }
  }, [selectedDate]);

  // Falls Datum noch nicht initialisiert ist, nichts rendern
  if (!selectedDate || !isValid(selectedDate)) return null;

  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleCloseDialog = () => setSelectedCourse(null);
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfSelectedWeek, i);
    return {
      dayOfWeek: day.toLocaleString("de-DE", { weekday: "short" }),
      dayOfMonth: day.getDate(),
      dateStr: format(day, "yyyy-MM-dd"),
    };
  });

  const selectedStr = format(selectedDate, "yyyy-MM-dd");

 const filteredCourses = mockCourses.filter((course) => {
  const matchesTime =
    filterTimes.length > 0 ? filterTimes.includes(course.time) : true;
  const matchesRoom =
    filterRooms.length > 0 ? filterRooms.includes(course.room) : true;
  const matchesTrainer =
    filterTrainers.length > 0
      ? filterTrainers.includes(course.trainer)
      : true;

  return (
    course.date === selectedStr &&
    matchesTime &&
    matchesRoom &&
    matchesTrainer
  );
});

  return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Kurskalender
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <WeekPicker
            selectedDate={selectedDate}
            onDateChange={(date) => {
              const monday = startOfWeek(new Date(date), { weekStartsOn: 1 });
              setSelectedDate(monday);
            }}
          />
          <Box>
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
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

        <Grid container spacing={2} justifyContent="space-between">
          {weekDays.map((day) => (
            <Grid key={day.dateStr} sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  padding: 1,
                  cursor: "pointer",
                  backgroundColor:
                    format(selectedDate, "yyyy-MM-dd") === day.dateStr
                      ? "#e0f7fa"
                      : "transparent",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
                onClick={() => {
                  const [year, month, dayNum] = day.dateStr
                    .split("-")
                    .map(Number);
                  const dateObj = new Date(year, month - 1, dayNum, 12); // Monat -1
                  setSelectedDate(dateObj);
                }}
              >
                <Typography variant="body2">{day.dayOfWeek}</Typography>
                <Typography variant="h6">{day.dayOfMonth}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Kurse am {selectedDate.toLocaleDateString("de-DE")}
          </Typography>
          {filteredCourses.length > 0 ? (
            <Grid container spacing={2}>
              {filteredCourses.map((course) => (
                <Grid key={course.id}>
                  <CourseCard course={course} onClick={handleCourseClick} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Keine Kurse für diesen Tag verfügbar.
            </Typography>
          )}
        </Box>

        <CourseDialog course={selectedCourse} onClose={handleCloseDialog} />
      </Box>
  );
};

export default Kurse;

