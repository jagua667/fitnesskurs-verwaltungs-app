/**
 * UserInfoCard – Benutzerinformationskarte
 *
 * Diese Komponente zeigt eine einfache Übersicht über den aktuell angemeldeten Nutzer an,
 * inklusive Avatar, Name, Rolle und einer Schaltfläche zum Bearbeiten des Profils.
 *
 * Eigenschaften:
 * - Es werden derzeit keine Props verwendet – die Inhalte sind statisch (z. B. "Max", "Kunde").
 *   → In einer echten Anwendung sollte der Benutzername und die Rolle dynamisch übergeben werden.
 *
 * Bestandteile:
 * - Avatar: Initialen oder Bildsymbol des Nutzers
 * - Benutzername: Begrüßung mit Name (z. B. „Willkommen, Max“)
 * - Rolle: Nutzerrolle (z. B. „Kunde“)
 * - Button: Möglichkeit zur Profilbearbeitung (aktuell ohne Funktionalität)
 *
 * Verwendete MUI-Komponenten:
 * - Card, CardContent, Avatar, Typography, Box, Button
 *
 * Styling:
 * - Vertikale Ausrichtung mit `display: flex` und `gap` für Abstand zwischen Avatar und Text
 * - Abstand nach unten mit `mb: 3` (margin-bottom)
 *
 * Hinweis:
 * - Zur Weiterentwicklung empfiehlt sich die Übergabe von Nutzerdaten als Props
 *   (z. B. `user.name`, `user.role`, `onEditProfile()`).
 */

import React from "react";
import { Card, CardContent, Typography, Avatar, Box, Button } from "@mui/material";

const UserInfoCard = () => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56 }}>M</Avatar>
        <Box>
          <Typography variant="h6">Willkommen, Max</Typography>
          <Typography variant="body2" color="text.secondary">Rolle: Kunde</Typography>
          <Button size="small" sx={{ mt: 1 }}>Profil bearbeiten</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;

