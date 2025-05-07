// src/components/KursItem.jsx
import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const KursItem = ({ kurs, onEdit, onDelete }) => {
  return (
    <Box sx={{ padding: 2, border: "1px solid #ddd", borderRadius: 2, marginBottom: 2 }}>
      <Typography variant="h6">{kurs.name}</Typography>
      <Typography variant="body2" color="text.secondary">{kurs.date} | {kurs.time}</Typography>
      <Typography variant="body2" color="text.secondary">{kurs.room}</Typography>
      <Typography variant="body2">{kurs.trainer || "Kein Trainer angegeben"}</Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 1 }}>
        <Tooltip title="Bearbeiten">
          <IconButton onClick={() => onEdit(kurs)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Löschen">
          <IconButton onClick={() => onDelete(kurs.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default KursItem;

