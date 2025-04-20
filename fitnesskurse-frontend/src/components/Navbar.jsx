// components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => (
  <nav className="navbar">
    <ul className="nav-links">
      <li><NavLink to="/login">Login</NavLink></li>
      <li><NavLink to="/register">Register</NavLink></li>
      <li><NavLink to="/dashboard/admin">Admin Dashboard</NavLink></li>
      <li><NavLink to="/dashboard/trainer">Trainer Dashboard</NavLink></li>
      <li><NavLink to="/dashboard/kunde">Kunden Dashboard</NavLink></li>
      <li><NavLink to="/kurse">Kurse</NavLink></li>
      <li><NavLink to="/bewertung">Bewertung</NavLink></li>
      <li><NavLink to="/kalender">Kalender</NavLink></li>
    </ul>
  </nav>
);

export default Navbar;

