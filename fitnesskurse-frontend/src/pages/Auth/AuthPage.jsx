/**
 * AuthPage-Komponente
 * --------------------
 * Diese Komponente stellt eine Authentifizierungsseite dar, die sowohl Login als auch Registrierung ermöglicht.
 * Je nach Benutzerrolle wird nach erfolgreichem Login eine Weiterleitung zu unterschiedlichen Dashboards durchgeführt.
 * 
 * Funktionen:
 * - Login mit E-Mail und Passwort
 * - Registrierung inkl. Rollenauswahl und Passwortabgleich
 * - Umschaltung zwischen Passwort sichtbar/unsichtbar
 * - Rollenabhängige Weiterleitung
 * 
 * Relevante Pfade:
 * - POST /auth/register — zum Registrieren eines neuen Benutzers
 */

import React, { useState, useEffect } from "react";
import axios from "../../api/axios";  // Axios-Instanz mit Backend-Basis-URL
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  FormLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";  // Custom Auth Context Hook
import { useNavigate } from "react-router-dom";

/**
 * Hauptkomponente der Authentifizierungsseite
 */
const AuthPage = () => {
  // Aktive Tab-Auswahl: 0 = Login, 1 = Registrierung
  const [tabIndex, setTabIndex] = useState(0);

  // Passwortfeld sichtbar/unsichtbar schalten
  const [showPassword, setShowPassword] = useState(false);

  // Zustand für alle Formulareingaben (Login & Registrierung)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "kunde",   // Default-Rolle
  });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  /**
   * Effekt: Falls ein Benutzer bereits eingeloggt ist, erfolgt automatische Weiterleitung basierend auf Rolle
   */
  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase();
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "trainer") navigate("/dashboard/trainer");
      else if (role === "kunde") navigate("/courses");
      else navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Tab-Wechsel
  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  // Sichtbarkeit des Passwortfelds umschalten
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Generische Änderung für alle Textfelder
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Login-Handler
   * Ruft die login-Funktion aus dem AuthContext auf und zeigt bei Fehlern eine Warnung
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const success = await login(email, password);
    if (!success) {
      alert("Login fehlgeschlagen: Bitte überprüfe deine Eingaben.");
    }
  };

  /**
   * Registrierungshandler
   * - Prüft Passwortbestätigung
   * - Sendet POST-Anfrage an die API zum Anlegen eines neuen Benutzers
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      alert("Passwörter stimmen nicht überein.");
      return;
    }

    try {
      await axios.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      alert("Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
      setTabIndex(0);   // Nach Registrierung zurück zum Login-Tab
    } catch (err) {
      console.error("Registrierung fehlgeschlagen", err);
      alert("Registrierung fehlgeschlagen: " + (err.response?.data?.message || "Unbekannter Fehler"));
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card sx={{ maxWidth: 450, width: "100%", boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Willkommen bei Fitnow
          </Typography>

          {/* Tab-Steuerung für Login vs. Registrierung */}
          <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Registrieren" />
          </Tabs>

          {/* Login-Formular */}
          {tabIndex === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="E-Mail"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                label="Passwort"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }}>
                Einloggen
              </Button>
            </Box>
          )}

          {/* Registrierungsformular */}
          {tabIndex === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                label="E-Mail"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                label="Passwort"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Passwort bestätigen"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Rollenwahl via Radio Buttons */}
              <FormLabel sx={{ mt: 2 }}>Rolle auswählen</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel value="Kunde" control={<Radio />} label="Kunde" />
                <FormControlLabel value="Trainer" control={<Radio />} label="Trainer" />
                <FormControlLabel value="Admin" control={<Radio />} label="Admin" />
              </RadioGroup>

              {/* Zustimmung zu AGB und Datenschutz */}
              <FormControlLabel
                control={<Checkbox required />}
                label="Ich stimme den AGB zu"
                sx={{ mt: 2 }}
              />
              <FormControlLabel
                control={<Checkbox required />}
                label="Ich akzeptiere die Datenschutzbestimmungen"
                sx={{ mt: 1 }}
              />

              <Button type="submit" variant="outlined" fullWidth sx={{ mt: 3, py: 1.5 }}>
                Registrierung abschließen
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;
