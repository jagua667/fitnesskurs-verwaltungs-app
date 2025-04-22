// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp < Date.now() / 1000;

    if (isExpired) {
      localStorage.removeItem("authToken");
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Ungültiges Token", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

