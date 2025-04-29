import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const drawerWidth = 240; // ← Sidebar-Breite
const navbarHeight = 64; // ← Höhe der Navbar

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar oben */}
      <Navbar />

      {/* Sidebar + Hauptinhalt */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />

        {/* Hauptinhalt, mit Abstand zur Sidebar & Navbar */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 3,
            marginLeft: `${drawerWidth}px`, // 👈 Sidebar berücksichtigen!
            marginTop: `${navbarHeight}px`, // 👈 Navbar berücksichtigen!
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

