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
} from '@mui/material';
import { useState } from 'react';

const initialUsers = [
  { id: 1, name: 'Anna Becker', email: 'anna@example.com', role: 'Kunde' },
  { id: 2, name: 'Max Schulz', email: 'max@example.com', role: 'Trainer' },
  { id: 3, name: 'Lisa Meier', email: 'lisa@example.com', role: 'Admin' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleAction = (userId, actionType) => {
    const user = users.find(u => u.id === userId);
    const confirm = window.confirm(`${user.name} wirklich ${actionType}?`);
    if (!confirm) return;

    setSnackbar({
      open: true,
      message: `${user.name} wurde ${actionType === 'löschen' ? 'gelöscht' : 'gesperrt'}.`,
      severity: actionType === 'löschen' ? 'error' : 'warning',
    });

    if (actionType === 'löschen') {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
    // Bei „sperren“ könnten wir z. B. einen Status setzen oder später eine API callen
  };

  return (
    <Card sx={{ margin: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Benutzerverwaltung
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleAction(user.id, 'sperren')}
                    >
                      Sperren
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleAction(user.id, 'löschen')}
                    >
                      Löschen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}

