/**
 * Haupt-App-Komponente mit Routing und Theme-Provider.
 * 
 * - Verwendet Material-UI ThemeProvider für konsistente Farben und Typografie.
 * - SocketProvider stellt den Socket-Kontext für WebSockets und somit die Push-Benachrichtungen bereit.
 * - AuthProvider stellt den Authentifizierungs-Kontext bereit.
 * - React Router definiert alle Routen der App.
 * - ProtectedRoute-Komponente schützt Seiten je nach Benutzerrolle:
 *   - Admin: Zugriff auf Dashboard, User-Management, Bewertungen, Kurse
 *   - Trainer: Zugriff auf Trainer-Dashboard, Buchungen, Bewertungen
 *   - Kunde: Zugriff auf Kursübersicht, eigene Buchungen, Bewertungen
 * - Unbekannte oder nicht autorisierte Zugriffe werden mit passenden Fehlermeldungen abgefangen.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from './context/SocketContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from "./context/AuthContext";
import CourseUpdateListener from "./components/CourseUpdateListener";
import Layout from "./components/Layout";
import AuthPage from "./pages/Auth/AuthPage";
import Logout from "./pages/Auth/Logout";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TrainerDashboard from "./pages/Dashboard/TrainerDashboard";
import Courses from "./pages/Courses";
import Rating from "./pages/Rating";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from './pages/UserManagement';
import CourseOverview from './pages/CourseOverview';
import NewRatings from './pages/NewRatings';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Hauptfarbe (blau)
    },
    secondary: {
      main: '#f50057',  // Sekundärfarbe (pink)
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

function App() {
  return (
    <SocketProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
           <SnackbarProvider>
            <CourseUpdateListener /> 
            <Routes>
              <Route path="*" element={<div>Seite nicht gefunden</div>} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/logout" element={<Logout />} />

              {/* Fehlerseite für unberechtigte Zugriffe */}
              <Route path="/unauthorized" element={<div>Keine Berechtigung</div>} />

              {/* Admin-Dashboard */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Trainer-Dashboard */}
              <Route
                path="/dashboard/trainer"
                element={
                  <ProtectedRoute allowedRoles={["trainer"]}>
                    <Layout>
                      <TrainerDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />


              <Route
                path="/dashboard/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </ProtectedRoute>
                }
              />


              <Route
                path="/dashboard/admin/newRatings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Layout>
                      <NewRatings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Layout>
                      <CourseOverview />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Kurse, die Kundinnen und Kunden buchen können (war: "admin", "trainer", "kunde")*/}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["kunde"]}>
                    <Layout>
                      <Courses />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
                    <Layout> <MyBookings /></Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/rating"
                element={
                  <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
                    <Layout><Rating /></Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
           </SnackbarProvider>
          </AuthProvider>
        </ThemeProvider>
    </SocketProvider>
  );
}

export default App;

