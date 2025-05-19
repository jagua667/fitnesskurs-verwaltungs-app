import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { AccessTime, Group, Event, Star, FileCopy } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* KPIs */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox 
            title="Aktive Nutzer"
            value="1,234"
            icon={<Group />}
            bgColor="lightblue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox 
            title="Aktive Kurse"
            value="45"
            icon={<Event />}
            bgColor="lightgreen"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox 
            title="Buchungen"
            value="320 / 15"
            icon={<AccessTime />}
            bgColor="lightcoral"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIBox 
            title="Ø Bewertung"
            value="4.6 ⭐"
            icon={<Star />}
            bgColor="lightyellow"
          />
        </Grid>
      </Grid>

      {/* Quick Actions / Shortcuts */}
      <Grid container spacing={4} style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <ShortcutCard 
            label="Benutzerverwaltung" 
            link="/dashboard/admin/users"
            icon={<Group />} 
            bgColor="lightgray" 
          />
        </Grid>
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
            link="/admin/reviews" 
            icon={<Star />} 
            bgColor="lightgreen" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            style={{ height: '100%' }}
          >
            CSV-Export <FileCopy style={{ marginLeft: '10px' }} />
          </Button>
        </Grid>
      </Grid>

      {/* Letzte Aktivität */}
      <Grid container spacing={4} style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={4} md={4}>
          <ActivityCard 
            title="Neu angelegte Kurse"
            content="5 Kurse wurden gestern hinzugefügt."
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <ActivityCard 
            title="Neue Bewertungen"
            content="10 neue Bewertungen für Kurse."
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <ActivityCard 
            title="Letzte Logins"
            content="Admin: 2025-05-11 09:30"
          />
        </Grid>
      </Grid>
    </div>
  );
}

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

