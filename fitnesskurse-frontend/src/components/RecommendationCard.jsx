/**
 * RecommendationCard – Informationskarte für persönliche Kursvorschläge
 *
 * Diese Komponente zeigt einen Hinweisbereich an, in dem zukünftig personalisierte
 * Kursempfehlungen angezeigt werden könnten. Derzeit ist sie rein statisch.
 *
 * Verwendete UI-Elemente:
 * - MUI Card & CardContent zur Darstellung im Kartenformat
 * - MUI Typography für Titel und Beschreibung
 *
 * Verhalten:
 * - Zeigt eine Überschrift („Persönliche Empfehlungen“)
 * - Informiert den Nutzer darüber, dass hier künftig Vorschläge erscheinen können
 *
 * Props:
 * - keine (aktuell statisch)
 *
 * Hinweise:
 * - Diese Komponente kann später erweitert werden, um dynamische Kursvorschläge auf Basis
 *   von Nutzerverhalten, Interessen oder bisherigen Buchungen darzustellen.
 */

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

