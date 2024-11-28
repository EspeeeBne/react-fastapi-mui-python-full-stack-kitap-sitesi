import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books');
        setBooks(response.data.books);
      } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Kitap Listesi</Typography>
      <Grid container spacing={4}>
        {books.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={book.cover_url || 'https://via.placeholder.com/150'}
                alt={book.title}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yazar: {book.author}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px' }}
                  onClick={() => alert('Kitap detayı sayfasına yönlendirilecek')}
                >
                  Detayları Gör
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BookList;
