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

const NewReviews = () => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();  // Korrekt innerhalb des Components verwenden

  useEffect(() => {
    // Beispiel-Daten, hier könntest du später eine API verwenden
    setReviews([
      {
        id: 1,
        course: 'React Kurs',
        user: 'Max Mustermann',
        rating: 5,
        comment: 'Sehr gut!',
      },
      {
        id: 2,
        course: 'Vue Kurs',
        user: 'Erika Mustermann',
        rating: 4,
        comment: 'Gut, aber etwas schwierig.',
      },
    ]);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Neue Bewertungen
      </Typography>

      {/* Bewertungen anzeigen */}
      <Grid container spacing={4}>
        {reviews.map((review) => (
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

      {/* Button für mehr Details */}
      <Grid container spacing={4} style={{ marginTop: '40px' }}>
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
      </Grid>
    </div>
  );
};

export default NewReviews;

