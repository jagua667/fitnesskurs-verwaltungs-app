import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NewRatings = () => {
  const [ratings, setRatings] = useState([]);
  const navigate = useNavigate();  // Korrekt innerhalb des Components verwenden

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('/api/admin/newRatings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) throw new Error("Fehler beim Laden der Bewertungen");

        const data = await response.json();
        setRatings(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Neue Bewertungen
      </Typography>

      {/* Bewertungen anzeigen */}
      <Grid container spacing={4}>
        {ratings.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Card>
              <CardContent>
                <List>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={<Typography variant="h6">{review.course}</Typography>}
                      secondary={
                        <span>
                          <Typography variant="body2" color="textSecondary" component="span">
                            {review.user} – {review.rating} <Star fontSize="small" />
                          </Typography>
                          <br />
                          <Typography variant="body2" color="textSecondary" component="span">
                            Kommentar: {review.comment}
                          </Typography>
                        </span>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Optionaler Button zur Navigation */}
      {/* <Grid container spacing={4} style={{ marginTop: '40px' }}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/rating')}
          >
            Mehr Details anzeigen
          </Button>
        </Grid>
      </Grid> */}
    </div>
  );
};

export default NewRatings;

