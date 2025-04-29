import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext"; // Nutze echten User aus Auth

const Navbar = () => {
  const { user } = useAuth(); // Hol dir den echten User

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        color: "#333",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ px: 3, justifyContent: "space-between" }}>
        {/* Links: Logo */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          FitNow
        </Typography>

        {/* Mitte: Begrüßung */}
        {user && (
         <Typography
  variant="body1"
  sx={{
    flexGrow: 1,
    textAlign: "center",
    textTransform: "uppercase", // <-- Alles in Großbuchstaben
  }}
>
  Hallo {user.name}!
</Typography>

        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

