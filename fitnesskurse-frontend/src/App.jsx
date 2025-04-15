// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import DashboardAdmin from "./components/Dashboard/DashboardAdmin";
import DashboardTrainer from "./components/Dashboard/DashboardTrainer";
import DashboardKunde from "./components/Dashboard/DashboardKunde";
import Kurse from "./components/Kurse/Kurse";
import Bewertung from "./components/Bewertung/Bewertung";
import Kalender from "./components/Kalender/Kalender";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

           {/* Protected Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/trainer"
              element={
                <ProtectedRoute>
                  <DashboardTrainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/kunde"
              element={
                <ProtectedRoute>
                  <DashboardKunde />
                </ProtectedRoute>
              }
            />



            {/* Weitere Routen */}
            <Route path="/kurse" element={<Kurse />} />
            <Route path="/bewertung" element={<Bewertung />} />
            <Route path="/kalender" element={<Kalender />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

