import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from "@mui/material";
import Layout from "../../components/Layout";
import axios from "axios";
import UserInfoCard from "../../components/UserInfoCard";
import CourseOverviewCard from "../../components/CourseOverviewCard";
import RecommendationCard from "../../components/RecommendationCard";

const DashboardKunde = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // API-Aufruf zum Abrufen der Kurse
  useEffect(() => {
    axios
      .get("/api/fitnesskurse")
      .then((response) => {
        console.log("API Antwort:", response.data);  // Konsolenausgabe der Antwort
        setCourses(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Kurse:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Willkommen im Kundenbereich
        </Typography>

        <Typography variant="body1" gutterBottom>
          Hier findest du deine gebuchten Kurse, persönliche Empfehlungen und Fortschritte.
        </Typography>

        {/* Benutzerinfo */}
        <UserInfoCard />

        {/* Kursübersicht */}
        <Grid container spacing={3}>
          {loading ? (
            <CircularProgress />
          ) : (
            courses.length > 0 ? (
              courses.map((course) => (
                <Grid sx={{ flex: 1 }} key={course.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{course.name}</Typography>
                      <Typography variant="body2">{course.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1">Keine gebuchten Kurse gefunden.</Typography>
            )
          )}
        </Grid>
      </Box>
    </Layout>
  );
};

export default DashboardKunde;

