import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  Paper,
  Rating,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { startOfWeek, addDays, format, isValid, addWeeks, subWeeks } from "date-fns";

import { mockCourses } from "../mock/courses";
import CourseDialog from "../components/CourseDialog";
import WeekPicker from "../components/WeekPicker";
import CourseFilter from "../components/CourseFilter";

const timeSlots = [
  { label: "Vormittag", start: "08:00", end: "12:00" },
  { label: "Mittag", start: "12:00", end: "14:00" },
  { label: "Nachmittag", start: "14:00", end: "18:00" },
  { label: "Abend", start: "18:00", end: "22:00" },
];

const Courses = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterTimes, setFilterTimes] = useState([]);
  const [filterRooms, setFilterRooms] = useState([]);
  const [filterTrainers, setFilterTrainers] = useState([]);

  useEffect(() => {
    if (!selectedDate || !isValid(selectedDate)) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      setSelectedDate(monday);
    }
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

  // Sortiert die Kurse nach Zeit und dann Name
  const getCoursesByDayAndSlot = (dayStr, slot) => {
    return mockCourses
      .filter(course => course.date === dayStr)
      .filter(course => {
        const [start] = course.time.split(" - ");
        return start >= slot.start && start < slot.end;
      })
      .filter(course => {
        const matchesTime = filterTimes.length > 0 ? filterTimes.includes(course.time) : true;
        const matchesRoom = filterRooms.length > 0 ? filterRooms.includes(course.room) : true;
        const matchesTrainer = filterTrainers.length > 0 ? filterTrainers.includes(course.trainer) : true;
        return matchesTime && matchesRoom && matchesTrainer;
      })
      .sort((a, b) => {
        const aStart = a.time.split(" - ")[0];
        const bStart = b.time.split(" - ")[0];
        return aStart === bStart
          ? a.name.localeCompare(b.name)
          : aStart.localeCompare(bStart);
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
                    <Paper
                      key={course.id}
                      onClick={() => handleCourseClick(course)}
                      sx={{
                        p: 1,
                        mb: 1,
                        cursor: "pointer",
                        backgroundColor: "#e3f2fd",
                      }}
                    >
                      <Typography variant="subtitle2">{course.name}</Typography>
                      <Rating value={course.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2">{course.time}</Typography>
                      <Typography variant="body2">{course.trainer}</Typography>
                      <Typography variant="body2">{course.room}</Typography>
                    </Paper>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      <CourseDialog course={selectedCourse} onClose={handleCloseDialog} />
    </Box>
  );
};

export default Courses;

