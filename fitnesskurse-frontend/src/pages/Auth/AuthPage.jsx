import React, { useState } from "react";
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
  Link,
  FormControlLabel,
  Checkbox,
  FormControl,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AuthPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const handleRememberMeChange = (event) => setRememberMe(event.target.checked);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e3f2fd, #bbdefb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: "100%", boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Willkommen bei Fitnow
          </Typography>

          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Registrieren" />
          </Tabs>

          {tabIndex === 0 ? (
            <>
              <Box component="form" sx={{ mt: 3 }}>
                <TextField
                  label="E-Mail"
                  type="email"
                  fullWidth
                  margin="normal"
                  autoComplete="email"
                />
                <TextField
                  label="Passwort"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  autoComplete="current-password"
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
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={handleRememberMeChange} color="primary" />}
                  label="Angemeldet bleiben"
                  sx={{ mt: 1 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ fontWeight: "bold", borderColor: "#4267B2", color: "#4267B2" }}
                  >
                    Mit Facebook anmelden
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ fontWeight: "bold", borderColor: "#DB4437", color: "#DB4437" }}
                  >
                    Mit Google anmelden
                  </Button>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Link href="#" underline="hover" variant="body2">
                    Passwort vergessen?
                  </Link>
                  <Link
                    component="button"
                    onClick={() => setTabIndex(1)}
                    underline="hover"
                    variant="body2"
                  >
                    Neu hier? Registrieren
                  </Link>
                </Box>
                <Link href="#" underline="hover" variant="body2" sx={{ mt: 2, display: "block", textAlign: "center" }}>
                  Hilfe / Support
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: "bold",
                    background: "linear-gradient(to bottom, #64b5f6, #1976d2)",
                    color: "#fff",
                    "&:hover": {
                      background: "linear-gradient(to bottom, #42a5f5, #1565c0)",
                    },
                  }}
                >
                  Einloggen
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box component="form" sx={{ mt: 3 }}>
                <TextField
                  label="Vorname"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Nachname"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="E-Mail"
                  type="email"
                  fullWidth
                  margin="normal"
                  autoComplete="email"
                />
                <TextField
                  label="Geburtsdatum"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Geschlecht</FormLabel>
                  <RadioGroup row defaultValue="other">
                    <FormControlLabel value="female" control={<Radio />} label="Weiblich" />
                    <FormControlLabel value="male" control={<Radio />} label="Männlich" />
                    <FormControlLabel value="other" control={<Radio />} label="Divers" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label="Passwort"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
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
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
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
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label={`Ich stimme den <Link href="#" target="_blank" rel="noopener noreferrer">AGB</Link> zu`}
                  sx={{ mt: 2, display: "block" }}
                />
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label={`Ich habe die <Link href="#" target="_blank" rel="noopener noreferrer">Datenschutzbestimmungen</Link> gelesen und akzeptiere sie`}
                  sx={{ mt: 1, display: "block" }}
                />
                <TextField
                  label="Rolle auswählen (z. B. Kunde, Trainer, Admin)"
                  fullWidth
                  margin="normal"
                  placeholder="Kunde"
                />
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: "bold",
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                      borderColor: "#1565c0",
                    },
                  }}
                >
                  Registrierung abschließen
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;
