import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CourseOverviewCard = ({ title, content }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CourseOverviewCard;

