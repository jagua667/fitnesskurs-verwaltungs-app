// components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const token = localStorage.getItem("authToken");

  if (!token) return null; // Falls kein Token vorhanden ist, wird keine Sidebar angezeigt

  let role = null;
  try {
    const decoded = jwtDecode(token);
    role = decoded.role; // Rolle des Benutzers aus dem Token
  } catch (error) {
    console.error("Ungültiges Token", error);
    return null; // Falls der Token ungültig ist, wird keine Sidebar angezeigt
  }

  return (
    <div className="sidebar">
      <ul>
        {/* Zeige nur das Admin-Dashboard an, wenn der Benutzer ein Admin ist */}
        {role === "admin" && (
          <li><Link to="/dashboard/admin">Admin Dashboard</Link></li>
        )}

        {/* Zeige nur das Trainer-Dashboard an, wenn der Benutzer ein Trainer ist */}
        {role === "trainer" && (
          <li><Link to="/dashboard/trainer">Trainer Dashboard</Link></li>
        )}

        {/* Zeige nur das Kunden-Dashboard an, wenn der Benutzer ein Kunde ist */}
        {role === "kunde" && (
          <li><Link to="/dashboard/kunde">Kunden Dashboard</Link></li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

