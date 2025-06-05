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
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Fehler beim Laden der Benutzer", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAction = async (userId, actionType) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const isLocked = user.locked;
    const confirmText = actionType === "toggleLock"
      ? `${user.name} wirklich ${isLocked ? "entsperren" : "sperren"}?`
      : `${user.name} wirklich löschen?`;

    const confirm = window.confirm(confirmText);
    if (!confirm) return;

    try {
      if (actionType === "delete") {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSnackbar({ open: true, message: `${user.name} wurde gelöscht.`, severity: "error" });
      }

      if (actionType === "toggleLock") {
        const newLockedStatus = !isLocked;

        await axios.put(
          `http://localhost:5000/api/admin/users/lock`,
          { userId, locked: newLockedStatus },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, locked: newLockedStatus } : u))
        );

        setSnackbar({
          open: true,
          message: `${user.name} wurde ${newLockedStatus ? "gesperrt" : "entsperrt"}.`,
          severity: newLockedStatus ? "warning" : "success",
        });
      }
    } catch (error) {
      console.error("Fehler bei Benutzeraktion", error);
      setSnackbar({
        open: true,
        message: "Aktion fehlgeschlagen",
        severity: "error",
      });
    }
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
                <TableCell>Status</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.locked ? "Gesperrt" : "Aktiv"}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color={user.locked ? "success" : "warning"}
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleAction(user.id, 'toggleLock')}
                    >
                      {user.locked ? "Entsperren" : "Sperren"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleAction(user.id, 'delete')}
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
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}

