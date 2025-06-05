import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
    <ThemeProvider theme={theme}>
      <AuthProvider>
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
            path="/dashboard/admin/ratings"
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
      </AuthProvider>
    </ThemeProvider>

  );
}

export default App;

