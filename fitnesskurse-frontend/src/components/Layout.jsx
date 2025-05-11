import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from '../context/AuthContext'; 

const drawerWidth = 240; // ← Sidebar-Breite
const navbarHeight = 64; // ← Höhe der Navbar

const Layout = ({ children }) => {
  const { user } = useAuth();
  const menuItemsByRole = {
    kunde: [
      { label: "Kurse", path: "/courses" },
      { label: "Meine Buchungen", path: "/my-bookings" },
      { label: "Logout", path: "/logout" },
    ],
    trainer: [
      { label: "Dashboard", path: "/dashboard/trainer" },
      { label: "Kurse", path: "/courses" },
      { label: "Kalender", path: "/calendar" },
      { label: "Logout", path: "/logout" },
    ],
  };
  const menuItems = menuItemsByRole[user?.role] || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar oben */}
      <Navbar />

      {/* Sidebar + Hauptinhalt */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar menuItems={menuItems} />


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

