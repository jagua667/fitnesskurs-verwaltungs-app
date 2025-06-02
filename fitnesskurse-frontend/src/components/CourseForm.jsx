import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";

const defaultData = {
  title: "",
  description: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  max_capacity: "",
  course_level: "",
  notes: "",
  trainer_name: "",
  repeat: "",
  repeat_until: "",
};

const levelOptions = [
  { value: "", label: "Bitte wählen" },
  { value: "beginner", label: "Anfänger" },
  { value: "intermediate", label: "Mittel" },
  { value: "advanced", label: "Fortgeschritten" },
];

const CourseForm = ({
  open,
  onClose,
  course,
  onSave,
  showMaxCapacity = true, // optional Prop, falls Max. Teilnehmerzahl versteckt werden soll
  currentTrainerName = "", // falls Trainername aus Login vorgegeben wird
}) => {
  const [formData, setFormData] = useState(defaultData);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

useEffect(() => {
  if (course) {
    const {
      start_time,
      end_time,
      date,
      name,
      description,
      room,
      max_capacity,
      course_level, // Besteht nicht - aktuell ein Platzhalter
      notes, // Besteht nicht - aktuell ein Platzhalter
      trainer,
      repeat,
      repeat_until,
    } = course;

    // Korrektes Datumsformat erzeugen (z.B. "2025-05-30")
    const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : date;

    // Start-/Endzeit kombinieren mit Datum
    const start = new Date(`${dateStr}T${start_time}:00`);
    const end = new Date(`${dateStr}T${end_time}:00`);

    // Wichtig: Start-/Endzeit lokal formatieren (nicht UTC), sonst 08:00 statt 10:00
    const formatTime = (dateObj) =>
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    setFormData({
      title: name || "",                          // 'name' statt 'title' in der course-Prop
      description: description || "",
      startDate: dateStr || "",
      startTime: formatTime(start),
      endDate: dateStr || "",
      endTime: formatTime(end),
      location: room || "",                  
      max_capacity: max_capacity || "",          
      course_level: course_level || "",          
      notes: notes || "",                        
      trainer_name: trainer || currentTrainerName || "",
      repeat: repeat ?? "",
      repeat_until: repeat_until?.slice(0, 10) ?? "",
    });
  } else {
    setFormData({ ...defaultData, trainer_name: currentTrainerName || "" });
  }

  setErrors({});
  console.log("Empfangener Kurs:", course);
}, [course, currentTrainerName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "max_capacity" && Number(value) > 30) {
      setErrors((prev) => ({
        ...prev,
        max_capacity: "Maximal 30 Teilnehmer erlaubt",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const tempErrors = {};

    if (!formData.title.trim()) tempErrors.title = "Titel ist erforderlich";
    if (!formData.startDate) tempErrors.startDate = "Startdatum fehlt";
    if (!formData.startTime) tempErrors.startTime = "Startzeit fehlt";
    if (!formData.endDate) tempErrors.endDate = "Endedatum fehlt";
    if (!formData.endTime) tempErrors.endTime = "Endzeit fehlt";

    const startStr = `${formData.startDate}T${formData.startTime}`;
    const endStr = `${formData.endDate}T${formData.endTime}`;
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (
      formData.startDate &&
      formData.startTime &&
      (isNaN(startDate.getTime()) || startDate.toString() === "Invalid Date")
    ) {
      tempErrors.startDate = "Ungültiges Startdatum/-zeit";
    }

    if (
      formData.endDate &&
      formData.endTime &&
      (isNaN(endDate.getTime()) || endDate.toString() === "Invalid Date")
    ) {
      tempErrors.endDate = "Ungültiges Enddatum/-zeit";
    }

    if (!tempErrors.startDate && !tempErrors.endDate && startDate > endDate) {
      tempErrors.endTime = "Endzeit muss nach Startzeit liegen";
    }

    if (showMaxCapacity) {
      const count = Number(formData.max_capacity);
      if (formData.max_capacity && isNaN(count))
        tempErrors.max_capacity = "Muss eine Zahl sein";
      else if (count > 30)
        tempErrors.max_capacity = "Maximal 30 Teilnehmer erlaubt";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);

    const start_time = `${formData.startDate}T${formData.startTime}`;
    const end_time = `${formData.endDate}T${formData.endTime}`;

    const saveData = {
      ...(course?.id && { id: course.id }), // 👈 ID bei bestehendem Kurs beibehalten
      title: formData.title,
      description: formData.description,
      start_time,
      end_time,
      location: formData.location,
      max_capacity: showMaxCapacity
        ? formData.max_capacity
          ? Number(formData.max_capacity)
          : null
        : null,
      course_level: formData.course_level || null,
      notes: formData.notes || null,
      trainer_name: formData.trainer_name || null,
      repeat: formData.repeat || null,
      repeat_until: formData.repeat_until || null,
    };

    try {
      await onSave(saveData); // falls asynchron
      setSnackbarOpen(true);
      onClose();
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      // Optional: weitere Fehleranzeige
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{course ? "Kurs bearbeiten" : "Kurs erstellen"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Titel"
            fullWidth
            margin="normal"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            required
          />

          <TextField
            label="Beschreibung"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Startdatum *"
                fullWidth
                margin="normal"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Startzeit *"
                fullWidth
                margin="normal"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                error={!!errors.startTime}
                helperText={errors.startTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Endedatum *"
                fullWidth
                margin="normal"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Endzeit *"
                fullWidth
                margin="normal"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                error={!!errors.endTime}
                helperText={errors.endTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

        <TextField
          select
          label="Wiederholung"
          fullWidth
          margin="normal"
          name="repeat"
          value={formData.repeat ?? ""}
          onChange={handleChange}
        >
          <MenuItem value="">Keine Wiederholung</MenuItem>
          <MenuItem value="weekly">Wöchentlich</MenuItem>
          <MenuItem value="monthly">Monatlich</MenuItem>
        </TextField>

        {formData.repeat && (
          <TextField
            label="Wiederholen bis"
            type="date"
            name="repeat_until"
            value={formData.repeat_until}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
        )}

          <TextField
            label="Ort"
            fullWidth
            margin="normal"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />

          {/* Kurslevel */}
          <TextField
            select
            label="Kurslevel"
            fullWidth
            margin="normal"
            name="course_level"
            value={formData.course_level}
            onChange={handleChange}
          >
            {levelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Hinweise für Teilnehmer */}
          <TextField
            label="Hinweise für Teilnehmer"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />

          {/* Trainername */}
          <TextField
            label="Trainername"
            fullWidth
            margin="normal"
            name="trainer_name"
            value={formData.trainer_name}
            onChange={handleChange}
          />

          {/* Max. Teilnehmerzahl optional */}
          {showMaxCapacity && (
            <TextField
              label="Maximale Teilnehmeranzahl"
              fullWidth
              margin="normal"
              name="max_capacity"
              type="number"
              value={formData.max_capacity ?? ""}
              onChange={handleChange}
              error={!!errors.max_capacity}
              helperText={errors.max_capacity || "Maximal 30 erlaubt"}
              inputProps={{ min: 1, max: 30 }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Box sx={{ flexGrow: 1, pl: 2, fontSize: 12, color: "text.secondary" }}>
            * Pflichtfelder
          </Box>
          <Button onClick={onClose} color="primary">
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? "Speichern..." : "Speichern"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Kurs erfolgreich gespeichert!
        </Alert>
      </Snackbar>
    </>
  );
};

export default CourseForm;
