import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Kunde",
  });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // 🔁 Automatische Weiterleitung nach Login je nach Rolle
  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase();
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "trainer") navigate("/dashboard/trainer");
      else if (role === "kunde") navigate("/courses");
      else navigate("/unauthorized");
    }
  }, [user, navigate]);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Login mit Context + Fehlerbehandlung
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const success = await login(email, password);
    if (!success) {
      alert("Login fehlgeschlagen: Bitte überprüfe deine Eingaben.");
    }
    // Weiterleitung erfolgt automatisch über useEffect, sobald user gesetzt ist
  };

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
      setTabIndex(0);
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

          <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Registrieren" />
          </Tabs>

          {/* ✅ Login-Formular */}
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

          {/* ✅ Registrierungsformular */}
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
