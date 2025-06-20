import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { AccessTime, Group, Event, Star, FileCopy } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * AdminDashboard-Komponente
 * Zeigt aktuelle Statistiken (KPIs), Shortcuts und Exportmöglichkeiten für Admins.
 * 
 * API:
 * - GET /api/admin/stats → Gesamtstatistiken
 * - GET /api/admin/export/courses → Export aller Kurse (CSV)
 * - GET /api/admin/export/ratings → Export aller Bewertungen (CSV)
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);   // KPIs aus der API

  // Lädt KPIs beim ersten Render
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Fehler beim Laden der Statistiken');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('AdminStats Error:', err);
      }
    };

    fetchStats();
  }, []);

  /**
* Lädt CSV-Dateien vom Server herunter (z. B. Kurse, Bewertungen)
* @param {string} endpoint - API-Endpunkt für den CSV-Export
* @param {string} filename - Dateiname für den Download
*/
  const downloadCSV = async (endpoint, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Fehler beim Herunterladen (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim CSV-Export:', error);
      alert('CSV-Export fehlgeschlagen. Siehe Konsole.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* KPI-Bereich */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox
            title="Aktive Nutzer"
            value={`${stats ? stats.activeUsers : 0}`}
            icon={<Group />}
            bgColor="lightblue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox
            title="Aktive Kurse"
            value={`${stats ? stats.activeCourses : 0}`}
            icon={<Event />}
            bgColor="lightgreen"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox
            title="Buchungen"
            value={`${stats ? stats.totalBookings : 0} / ${stats ? stats.todaysBookings : 0}`}
            icon={<AccessTime />}
            bgColor="lightcoral"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox
            title="Ø Bewertung"
            value={`${stats ? stats.avgRating : 0.0} ⭐`}
            icon={<Star />}
            bgColor="lightyellow"
          />
        </Grid>
      </Grid>

      {/* Admin-Shortcuts und CSV-Export */}
      <Grid container spacing={4} style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <ShortcutCard
            label="Benutzerverwaltung"
            link="/dashboard/admin/users"
            icon={<Group />}
            bgColor="lightgray"
          />
        </Grid>

        {/* CSV-Exports */}
        <Grid item xs={12} sm={6} md={3}>
          <ShortcutCard
            label="Kursübersicht"
            link="/dashboard/admin/courses"
            icon={<Event />}
            bgColor="lightblue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ShortcutCard
            label="Neue Bewertungen"
            link="/dashboard/admin/newRatings"
            icon={<Star />}
            bgColor="lightgreen"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => downloadCSV(
              'http://localhost:5000/api/admin/export/courses',
              'courses_export.csv'
            )}
          >
            Kurse CSV <FileCopy style={{ marginLeft: '10px' }} />
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => downloadCSV(
              'http://localhost:5000/api/admin/export/ratings',
              'ratings_export.csv'
            )}
          >
            Bewertungen CSV <FileCopy style={{ marginLeft: '10px' }} />
          </Button>
        </Grid>
      </Grid>

      {/* Letzte Aktivität */}
      <Grid container spacing={4} style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={4} md={4}>
          <ActivityCard
            title="Neu angelegte Kurse"
            content={`${stats ? stats.newCourses : 0} Kurs/-e wurden gestern hinzugefügt.`}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <ActivityCard
            title="Neue Bewertungen"
            content={`${stats ? stats.newRatings : 0} neue Bewertung/-en für Kurse.`}
          />
        </Grid>
        {/* Optional: letzte Logins etc. */}
      </Grid>
    </div>
  );
}

/**
 * KPIBox-Komponente
 * Zeigt eine einzelne Metrik im Dashboard.
 */
function KPIBox({ title, value, icon, bgColor }) {
  return (
    <Card sx={{ backgroundColor: bgColor, borderRadius: '10px', boxShadow: 3 }}>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6">{title}</Typography>
          </Grid>
          <Grid item>
            <div style={{ fontSize: '30px' }}>{icon}</div>
          </Grid>
        </Grid>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginTop: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * ShortcutCard-Komponente
 * Verlinkung zu Unterseiten des Admin Dashboards
 */
function ShortcutCard({ label, link, icon, bgColor }) {
  return (
    <Card sx={{ backgroundColor: bgColor, borderRadius: '10px', boxShadow: 3 }}>
      <CardContent>
        <Link to={link} style={{ textDecoration: 'none' }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">{label}</Typography>
            </Grid>
            <Grid item>
              <div style={{ fontSize: '30px' }}>{icon}</div>
            </Grid>
          </Grid>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * ActivityCard-Komponente
 * Zeigt letzte Aktivitäten im Adminbereich.
 */
function ActivityCard({ title, content }) {
  return (
    <Card sx={{ backgroundColor: 'whitesmoke', borderRadius: '10px', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" style={{ marginBottom: '10px' }}>
          {title}
        </Typography>
        <Typography variant="body2">{content}</Typography>
      </CardContent>
    </Card>
  );
}
