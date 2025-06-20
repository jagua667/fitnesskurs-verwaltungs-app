/**
 * CourseOverviewCard - Einfache Karte zur Anzeige von Überschrift und Inhalt
 *
 * Props:
 * @param {string} title   - Überschrift der Karte
 * @param {string|React.ReactNode} content - Inhaltstext oder beliebiger Inhalt, der unter der Überschrift angezeigt wird
 *
 * Verwendung:
 * Die Komponente zeigt eine Karte mit einem Titel (h6) und einem darunter stehenden Text/Content.
 * Sie eignet sich zur kompakten Übersicht oder Anzeige von kurzen Informationen.
 *
 * Beispiel:
 * <CourseOverviewCard
 *   title="Kursname"
 *   content="Dieser Kurs findet jeden Dienstag von 18:00 bis 19:00 Uhr statt."
 * />
 */

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

