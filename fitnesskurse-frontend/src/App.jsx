import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import AuthPage from "./pages/Auth/AuthPage";
import Logout from "./pages/Auth/Logout";
import Register from "./pages/Auth/Register";
import Admin from "./pages/Dashboard/Admin";
import TrainerDashboard from "./pages/Dashboard/TrainerDashboard";
import Courses from "./pages/Courses";
import Rating from "./pages/Rating";
import MyBookings from "./pages/MyBookings";
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
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rating"
          element={
            <ProtectedRoute allowedRoles={["trainer", "kunde"]}>
              <Rating />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

