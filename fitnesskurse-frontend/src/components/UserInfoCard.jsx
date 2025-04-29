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

