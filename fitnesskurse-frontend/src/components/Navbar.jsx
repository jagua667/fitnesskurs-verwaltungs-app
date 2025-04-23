// components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // Falls kein Token vorhanden ist, wird die Navigation ohne bestimmte Links angezeigt
  if (!token) {
    return (
      <nav className="navbar">
        <ul className="nav-links">
          <li><NavLink to="/login">Login</NavLink></li>
          <li><NavLink to="/register">Register</NavLink></li>
          <li><NavLink to="/kurse">Kurse</NavLink></li>
          <li><NavLink to="/bewertung">Bewertung</NavLink></li>
          <li><NavLink to="/kalender">Kalender</NavLink></li>
        </ul>
      </nav>
    );
  }

  // Token entschlüsseln und die Rolle herausfinden
  let role = null;
  try {
    const decoded = jwtDecode(token);
    role = decoded.role; // Rolle des Benutzers aus dem Token
  } catch (error) {
    console.error("Ungültiges Token", error);
    return null; // Falls der Token ungültig ist, wird nichts angezeigt
  }

  // Logout-Handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");  // Entfernt das Token aus localStorage
    navigate("/login");  // Weiterleitung zur Login-Seite
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        {/* Gemeinsame Links für alle Benutzer */}
        <li><NavLink to="/kurse">Kurse</NavLink></li>
        <li><NavLink to="/bewertung">Bewertung</NavLink></li>
        <li><NavLink to="/kalender">Kalender</NavLink></li>

        {/* Zeige das Dashboard nur basierend auf der Rolle */}
        {role === "admin" && (
          <li><NavLink to="/dashboard/admin">Admin Dashboard</NavLink></li>
        )}
        {role === "trainer" && (
          <li><NavLink to="/dashboard/trainer">Trainer Dashboard</NavLink></li>
        )}
        {role === "kunde" && (
          <li><NavLink to="/dashboard/kunde">Kunden Dashboard</NavLink></li>
        )}

        {/* Logout-Button für eingeloggte Benutzer */}
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;

