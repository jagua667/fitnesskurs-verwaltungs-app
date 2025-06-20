// components/ProtectedRoute.jsx

/**
 * ProtectedRoute – Geschützte Route basierend auf Authentifizierung und Rolle
 *
 * Diese Komponente schützt Routen, indem sie prüft:
 * 1. Ob ein Benutzer eingeloggt ist
 * 2. Ob der Benutzer eine der erlaubten Rollen besitzt
 *
 * Props:
 * - children (ReactNode): Der Inhalt, der geschützt gerendert werden soll
 * - allowedRoles (array, optional): Liste erlaubter Rollen (z. B. ['admin', 'trainer'])
 *
 * Verhalten:
 * - Wenn kein Benutzer eingeloggt ist → Weiterleitung zu "/login"
 * - Wenn die Rolle des Benutzers nicht erlaubt ist → Weiterleitung zu "/unauthorized"
 * - Wenn alles passt → Inhalt (children) wird angezeigt
 *
 * Hinweis:
 * - Nutzt `useAuth()` aus dem `AuthContext`, um auf den eingeloggten Benutzer zuzugreifen.
 * - Diese Komponente sollte in `<Route>`-Elementen verwendet werden, um geschützte Inhalte zu kapseln.
 */

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

