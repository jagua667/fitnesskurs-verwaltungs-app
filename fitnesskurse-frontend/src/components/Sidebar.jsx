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
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import DownloadIcon from "@mui/icons-material/Download";
import LogoutIcon from "@mui/icons-material/Logout";
import ClassIcon from "@mui/icons-material/Class";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";

// Import AuthContext
import { useAuth } from "../context/AuthContext";

const menuItemsByRole = {
  admin: [
    { label: 'Admin Dashboard', path: '/dashboard/admin', icon: <HomeIcon /> },
    { label: 'Alle Kurse', path: '/dashboard/admin/kurse', icon: <ListIcon /> },
    { label: 'Benutzerverwaltung', path: '/dashboard/admin/users', icon: <PeopleIcon /> },
    { label: 'Statistiken', path: '/dashboard/admin/statistiken', icon: <BarChartIcon /> },
    { label: 'Export', path: '/dashboard/admin/export', icon: <DownloadIcon /> },
  ],
  trainer: [
    { label: 'Trainer Dashboard', path: '/dashboard/trainer', icon: <HomeIcon /> },
  ],
  kunde: [
    { label: 'Meine Buchungen', path: '/dashboard/kunde', icon: <HomeIcon /> },
    { label: 'Kalender', path: '/dashboard/kunde/kalender', icon: <CalendarMonthIcon /> },
    { label: 'Bewertungen', path: '/dashboard/kunde/bewertungen', icon: <BarChartIcon /> },
  ],
};

const drawerWidth = 240;
const Sidebar = () => {
  const { user, loading } = useAuth();
  console.log("Sidebar user:", user);

  if (loading || !user) {
    return null;
  }
const menuItems = menuItemsByRole[user.role] || [];
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
      <List>{menuItems.map(({ label, path, icon }) => (
          <ListItemButton key={label} component={NavLink} to={path} sx={navItemStyle}>
            <ListItemIcon sx={iconStyle}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
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

