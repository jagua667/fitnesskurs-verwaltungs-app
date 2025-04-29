import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const RecommendationCard = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Persönliche Empfehlungen</Typography>
        <Typography variant="body2">
          Hier könnten dir demnächst passende Kurse vorgeschlagen werden.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;

