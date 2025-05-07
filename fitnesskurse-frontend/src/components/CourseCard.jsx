// components/CourseCard.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) =>
    i < rating ? <StarIcon key={i} fontSize="small" sx={{ color: 'gold' }} /> : <StarBorderIcon key={i} fontSize="small" sx={{ color: 'gold' }} />
  );

const CourseCard = ({ course, onClick }) => (
  <Box
    sx={{
      padding: 2,
      border: "1px solid #ddd",
      borderRadius: 2,
      cursor: "pointer",
      "&:hover": { backgroundColor: "#f0f0f0" },
    }}
    onClick={() => onClick(course)}
  >
    <Typography variant="h6">{course.name}</Typography>
    <Box mt={0.5}>
      <Typography variant="body2" color="text.secondary" component="div">
        4,0 {renderStars(4)} (35) {/* Platzhalter */}
      </Typography>
    </Box>
    <Typography variant="body2">{course.time}</Typography>
    <Typography variant="body2">{course.room}</Typography>
    <Typography variant="body2">
      {course.trainer || "Kein Trainer angegeben"}
    </Typography>
  </Box>
);

export default CourseCard;

