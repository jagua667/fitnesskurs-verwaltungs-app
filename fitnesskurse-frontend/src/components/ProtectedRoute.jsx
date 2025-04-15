// ProtectedRoute.jsx
import React from "react";
import { Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  // Wenn kein Token vorhanden ist, leite zum Login weiter
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Falls Token vorhanden, zeige die geschützte Komponente (children)
  return children;
};

export default ProtectedRoute;

