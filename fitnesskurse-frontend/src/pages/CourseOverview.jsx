import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem, Tooltip, IconButton, Stack,
} from '@mui/material';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';


const dummyTrainers = [
  { id: 1, name: 'Mira Klein' },
  { id: 2, name: 'Tom Bauer' },
  { id: 3, name: 'Sophie Winter' },
];

const initialCourses = [
  {
    id: 1,
    title: 'Yoga für Anfänger',
    description: 'Ein entspannter Einstieg in Yoga.',
    start_time: '2025-04-15T10:00',
    end_time: '2025-04-15T11:00',
    location: 'Raum 1',
    max_capacity: 15,
    trainer_id: 1,
    bookings: 12,
    created_at: '2025-04-01T09:00',
    updated_at: '2025-04-10T15:30',
  },
  {
    id: 2,
    title: 'HIIT Training',
    description: 'Hochintensives Intervalltraining.',
    start_time: '2025-04-16T12:00',
    end_time: '2025-04-16T13:00',
    location: 'Raum 2',
    max_capacity: 20,
    trainer_id: 2,
    bookings: 8,
    created_at: '2025-04-03T10:00',
    updated_at: '2025-04-12T16:45',
  },
];

export default function CourseOverview() {
  const [courses, setCourses] = useState(initialCourses);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedCourse, setEditedCourse] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const handleDelete = (id) => {
    const course = courses.find((c) => c.id === id);
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
    setSnackbar({ open: true, message: `Kurs "${courseToDelete.title}" wurde gelöscht.`, severity: 'error' });
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleEdit = (id) => {
    const course = courses.find((c) => c.id === id);
    setEditedCourse({ ...course });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedCourse((prev) => ({ ...prev, [name]: value, updated_at: dayjs().format('YYYY-MM-DDTHH:mm') }));
  };

  const handleEditSave = () => {
    setCourses((prev) => prev.map((c) => (c.id === editedCourse.id ? editedCourse : c)));
    setSnackbar({ open: true, message: `Kurs "${editedCourse.title}" wurde gespeichert.`, severity: 'success' });
    setEditDialogOpen(false);
  };

  const getTrainerName = (id) => {
    const trainer = dummyTrainers.find((t) => t.id === Number(id));
    return trainer ? trainer.name : 'Unbekannt';
  };

  return (
    <Card sx={{ margin: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Kursübersicht
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kursname</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Startzeit</TableCell>
                <TableCell>Endzeit</TableCell>
                <TableCell>Ort</TableCell>
                <TableCell>Kapazität</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell>Buchungen</TableCell>
                <TableCell>Erstellt am</TableCell>
                <TableCell>Zuletzt aktualisiert</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{dayjs(course.start_time).format('DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell>{dayjs(course.end_time).format('DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell>{course.location}</TableCell>
                  <TableCell>{course.max_capacity}</TableCell>
                  <TableCell>{getTrainerName(course.trainer_id)}</TableCell>
                  <TableCell>{course.bookings}</TableCell>
                  <TableCell>{dayjs(course.created_at).format('DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell>{dayjs(course.updated_at).format('DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Bearbeiten">
                        <IconButton size="small" onClick={() => handleEdit(course.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton size="small" color="error" onClick={() => handleDelete(course.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kurs bearbeiten</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Kursname" name="title" value={editedCourse?.title || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Beschreibung" name="description" value={editedCourse?.description || ''} onChange={handleEditChange} fullWidth multiline rows={3} />
          <TextField label="Startzeit" name="start_time" type="datetime-local" value={editedCourse?.start_time || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Endzeit" name="end_time" type="datetime-local" value={editedCourse?.end_time || ''} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Ort" name="location" value={editedCourse?.location || ''} onChange={handleEditChange} fullWidth />
          <TextField label="Maximale Kapazität" name="max_capacity" type="number" value={editedCourse?.max_capacity || ''} onChange={handleEditChange} fullWidth />
          <TextField
            select
            label="Trainer"
            name="trainer_id"
            value={editedCourse?.trainer_id || ''}
            onChange={handleEditChange}
            fullWidth
          >
            {dummyTrainers.map((trainer) => (
              <MenuItem key={trainer.id} value={trainer.id}>
                {trainer.name} (ID: {trainer.id})
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Erstellt am" value={editedCourse?.created_at || ''} InputProps={{ readOnly: true }} fullWidth disabled />
          <TextField label="Zuletzt aktualisiert" value={editedCourse?.updated_at || ''} InputProps={{ readOnly: true }} fullWidth disabled />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleEditSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Kurs löschen bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Möchtest du den Kurs <strong>{courseToDelete?.title}</strong> wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
