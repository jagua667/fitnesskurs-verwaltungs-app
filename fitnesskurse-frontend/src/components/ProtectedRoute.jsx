// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext verwenden

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();  // Benutzer aus AuthContext holen

  // Wenn kein Benutzer eingeloggt ist, zum Login weiterleiten
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wenn der Benutzer nicht die erlaubte Rolle hat, eine Unauthorized-Seite anzeigen
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Wenn der Benutzer eingeloggt ist und die richtige Rolle hat, den Inhalt rendern
  return children;
};

export default ProtectedRoute;

