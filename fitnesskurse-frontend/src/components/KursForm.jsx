import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

const defaultData = { name: '', description: '', date: '', time: '', room: '', trainer: '', maxParticipantCount: '' };

const KursForm = ({ open, onClose, kurs, onSave }) => {
  const [formData, setFormData] = useState(kurs || defaultData);

  // Aktualisiere formData, wenn sich kurs ändert
  useEffect(() => {
  setFormData({
    ...defaultData,
    ...(kurs || {}),
  });
}, [kurs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{kurs ? "Kurs bearbeiten" : "Kurs erstellen"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Kursname"
          fullWidth
          margin="normal"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          label="Beschreibung"
          fullWidth
          margin="normal"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          label="Datum"
          fullWidth
          margin="normal"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
        <TextField
          label="Uhrzeit"
          fullWidth
          margin="normal"
          name="time"
          value={formData.time}
          onChange={handleChange}
        />
        <TextField
          label="Raum"
          fullWidth
          margin="normal"
          name="room"
          value={formData.room}
          onChange={handleChange}
        />
        <TextField
          label="maximale Teilnehmeranzahl"
          fullWidth
          margin="normal"
          name="maxParticipantCount"
          type="number"
          value={formData.maxParticipantCount ?? ""}
          onChange={handleChange}
        />
        <TextField
          label="Trainer"
          fullWidth
          margin="normal"
          name="trainer"
          value={formData.trainer}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KursForm;

