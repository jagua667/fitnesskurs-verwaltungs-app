import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  Checkbox,
  Button,
  Box
} from '@mui/material';

const ParticipantConfirmationDialog = ({ open, onClose, event, onConfirm }) => {
  const initialState = event?.extendedProps?.participant?.reduce((acc, name) => {
    acc[name] = true; // standardmäßig: alle anwesend
    return acc;
  }, {}) || {};

  const [confirmed, setConfirmed] = useState(initialState);

  const handleToggle = (name) => {
    setConfirmed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = () => {
    // Hier später POST an Backend möglich
    console.log("Bestätigte Teilnehmer:", confirmed);
    onConfirm(confirmed); // weiterleiten an Parent
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{event?.title}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>Teilnahme bestätigen:</Typography>
        <List>
          {event?.extendedProps?.participant?.map((name, idx) => (
            <ListItem key={idx} disableGutters>
              <Checkbox
                checked={confirmed[name]}
                onChange={() => handleToggle(name)}
              />
              <Typography sx={{ ml: 1 }}>
                {confirmed[name] ? `✅ ${name}` : `❌ ${name}`}
              </Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={handleSubmit}>Bestätigen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantConfirmationDialog;

