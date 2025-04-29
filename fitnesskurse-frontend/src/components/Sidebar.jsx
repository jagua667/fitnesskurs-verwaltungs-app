import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";

// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ClassIcon from "@mui/icons-material/Class";

// Import AuthContext
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

const Sidebar = () => {
  const { user, loading } = useAuth();
  console.log("Sidebar user:", user);

  if (loading || !user) {
    return null;
  }

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100vh",
        backgroundColor: "#f5f7fa",
        color: "#333",
        position: "fixed",
        left: 0,
        top: 0,
        pt: 10,
        boxSizing: "border-box",
        borderRight: "1px solid #ddd",
      }}
    >
      <List>
        {/* Menüpunkt für alle Nutzer */}
        <ListItemButton component={NavLink} to="/kurse" sx={navItemStyle}>
          <ListItemIcon sx={iconStyle}><ClassIcon /></ListItemIcon>
          <ListItemText primary="Kurse" />
        </ListItemButton>

        {/* Nur für Kunden */}
        {user.role === "kunde" && (
          <>
            <ListItemButton component={NavLink} to="/meine-buchungen" sx={navItemStyle}>
              <ListItemIcon sx={iconStyle}><CalendarTodayIcon /></ListItemIcon>
              <ListItemText primary="Buchungen" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/profil" sx={navItemStyle}>
              <ListItemIcon sx={iconStyle}><PersonIcon /></ListItemIcon>
              <ListItemText primary="Mein Profil" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/logout" sx={navItemStyle}>
              <ListItemIcon sx={iconStyle}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );
};

const navItemStyle = {
  "&.active": {
    backgroundColor: "#1976d2",
    color: "#fff",
    "& .MuiListItemIcon-root": {
      color: "#fff",
    },
  },
  "&:hover": {
    backgroundColor: "#e3f2fd",
  },
};

const iconStyle = {
  color: "#1976d2",
  minWidth: 36,
};

export default Sidebar;

