// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar, Sidebar, Footer, ProtectedRoute } from "./components";
import Login from "./pages/Auth/Login";
import Logout from "./pages/Auth/Logout"; 
import Register from "./pages/Auth/Register";
import Admin from "./pages/Dashboard/Admin";
import Trainer from "./pages/Dashboard/Trainer";
import Kunde from "./pages/Dashboard/Kunde";
import Kurse from "./pages/Kurse";
import Bewertung from "./pages/Bewertung";
import Kalender from "./pages/Kalender";

function App() {
  return (
    <>
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
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/trainer"
              element={
                <ProtectedRoute>
                  <Trainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/kunde"
              element={
                <ProtectedRoute>
                  <Kunde />
                </ProtectedRoute>
              }
            />



            {/* Weitere Routen */}
            <Route path="/kurse" element={<ProtectedRoute>
      <Kurse />
    </ProtectedRoute>} />
            <Route path="/bewertung" element={<ProtectedRoute>
      <Bewertung />
    </ProtectedRoute>} />
            <Route path="/kalender" element={<ProtectedRoute>
      <Kalender />
    </ProtectedRoute>} />

            {/* Logout Route */}
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;

