import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import AuthPage from "./pages/Auth/AuthPage";
import Logout from "./pages/Auth/Logout";
import Register from "./pages/Auth/Register";
import Admin from "./pages/Dashboard/Admin";
import TrainerDashboard from "./pages/Dashboard/TrainerDashboard";
import Kunde from "./pages/Dashboard/Kunde";
import Kurse from "./pages/Kurse";
import Bewertung from "./pages/Bewertung";
import Kalender from "./pages/Kalender";
import MeineBuchungen from "./pages/MeineBuchungen";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/logout" element={<Logout />} />

        {/* Fehlerseite für unberechtigte Zugriffe */}
        <Route path="/unauthorized" element={<div>Keine Berechtigung</div>} />

        {/* Admin-Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Trainer-Dashboard */}
        <Route
          path="/dashboard/trainer"
          element={
              <Layout>
                <TrainerDashboard />
              </Layout>
          }
        />

        {/* Kunden-Dashboard (wenn gewünscht) */}
        <Route
          path="/dashboard/kunde"
          element={
            <ProtectedRoute allowedRoles={["kunde"]}>
              <Layout>
                <Kunde />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Gemeinsame Seiten */}
        <Route
          path="/kurse"
          element={
            <ProtectedRoute allowedRoles={["admin", "trainer", "kunde"]}>   <Layout>
              <Kurse />
   </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meine-buchungen"
          element={
            <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
              <MeineBuchungen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bewertung"
          element={
            <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
              <Bewertung />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kalender"
          element={
            <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
              <Kalender />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

