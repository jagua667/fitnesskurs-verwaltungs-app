import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // AuthProvider importieren
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Logout from "./pages/Auth/Logout";
import Register from "./pages/Auth/Register";
import Admin from "./pages/Dashboard/Admin";
import Trainer from "./pages/Dashboard/Trainer";
import Kunde from "./pages/Dashboard/Kunde";
import Kurse from "./pages/Kurse";
import Bewertung from "./pages/Bewertung";
import Kalender from "./pages/Kalender";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider> {/* AuthProvider um die App wickeln */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout Wrapper */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <Admin /> {/* Admin-Dashboard */}
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trainer"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <Layout>
                <Trainer /> {/* Trainer-Dashboard */}
              </Layout>
            </ProtectedRoute>
          }
        />
      <Route
  path="/kurse"
  element={
    <ProtectedRoute allowedRoles={["kunde", "admin", "trainer"]}>
      <Kurse />
    </ProtectedRoute>
  }
/>


        {/* Weitere geschützte Routen */}
        <Route
          path="/kurse"
          element={
            <ProtectedRoute allowedRoles={["kunde", "admin", "trainer"]}>
              <Kurse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bewertung"
          element={
            <ProtectedRoute allowedRoles={["kunde", "trainer"]}>
              <Bewertung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kurse"
          element={
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
              <Kurse />
            </ProtectedRoute>
          }
        />

        {/* Logout Route */}
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

