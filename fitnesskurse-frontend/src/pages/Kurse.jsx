import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Layout from "../components/Layout";
import mockCourses from "../mock/courses";
import CourseDialog from "../components/CourseDialog";
import WeekPicker from "../components/WeekPicker";
import { startOfWeek, addDays } from "date-fns";

// Kategorien für Filter
const categories = [
  "Gymnastik",
  "Aqua",
  "Beweglichkeit",
  "Bootcamp",
  "Crossfit",
];

const Kurse = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Beim Klick auf Kurs
  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleCloseDialog = () => setSelectedCourse(null);

  // Initial: Montag dieser Woche setzen
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      setSelectedDate(monday);
    }
  }, [selectedDate]);

  // Filter-Menü öffnen und schließen
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  if (!selectedDate) {
    return null; // Optional: oder ein Ladeindikator
  }

  // 7-Tage-Woche ab gewähltem Montag
  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfSelectedWeek, i);
    return {
      dayOfWeek: day.toLocaleString("de-DE", { weekday: "short" }),
      dayOfMonth: day.getDate(),
      dateStr: day.toISOString().split("T")[0],
    };
  });

  // Kurse filtern
  const selectedStr = selectedDate.toISOString().split("T")[0];
  const filteredCourses = mockCourses.filter((course) => {
    return (
      (!selectedCategory ||
        course.name.toLowerCase().includes(selectedCategory.toLowerCase())) &&
      course.date === selectedStr
    );
  });

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          Kurskalender
        </Typography>

        {/* Monat/Jahr & Filter-Symbol */}
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
              setSelectedDate(monday); // bleibe bei Date-Objekt
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
              <MenuItem onClick={() => setSelectedCategory(null)}>
                Alle Kategorien
              </MenuItem>
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* Wochenansicht */}
        <Grid container spacing={2} justifyContent="space-between">
          {weekDays.map((day) => (
            <Grid item key={day.dateStr} sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  padding: 1,
                  cursor: "pointer",
                  backgroundColor:
                    selectedDate.toISOString().split("T")[0] === day.dateStr
                      ? "#e0f7fa"
                      : "transparent",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
                onClick={() => setSelectedDate(new Date(day.dateStr))}
              >
                <Typography variant="body2">{day.dayOfWeek}</Typography>
                <Typography variant="h6">{day.dayOfMonth}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Kursliste */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Kurse am {selectedDate.toLocaleDateString("de-DE")}
          </Typography>
          {filteredCourses.length > 0 ? (
            <Grid container spacing={2}>
              {filteredCourses.map((course) => (
                <Grid item key={course.id}>
                  <Box
                    sx={{
                      padding: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                    onClick={() => handleCourseClick(course)}
                  >
                    <Typography variant="h6">{course.name}</Typography>
                    <Typography variant="body2">{course.time}</Typography>
                    <Typography variant="body2">{course.room}</Typography>
                  </Box>
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
    </Layout>
  );
};

export default Kurse;

