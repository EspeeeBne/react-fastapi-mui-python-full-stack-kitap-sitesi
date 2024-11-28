import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Grid, Box, AppBar, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Card, CardContent, CardMedia } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../api';

const HomePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [weeklyBooks, setWeeklyBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');

    if (!username) {
      navigate('/login');
      return;
    }

    const fetchBooks = async () => {
      try {
        const userResponse = await api.get(`/profile/${username}`);
        const completedBooks = userResponse.data.completed_books;
        const booksResponse = await api.get('/books');
        const allBooks = booksResponse.data.books;
        const weeklyBooksDetails = completedBooks.map(bookId =>
          allBooks.find(book => book.id === bookId)
        );
        setWeeklyBooks(weeklyBooksDetails);
      } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
      }
    };
    fetchBooks();
  }, [navigate]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const handleAddBook = () => {
    navigate('/add-book');
  };

  const handleChangeBookStatus = () => {
    navigate('/change-status');
  };

  const sideBarItems = [
    { text: 'Ana Sayfa', icon: <HomeIcon />, link: '/' },
    { text: 'Arkadaş Bul', icon: <PersonSearchIcon />, link: '/find-friend' },
  ];

  return (
    <Grid container>
      <Grid item xs={2} style={{ height: '100vh', backgroundColor: '#f4f4f4' }}>
        <List>
          {sideBarItems.map((item, index) => (
            <ListItem button key={index} component={Link} to={item.link}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={10}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              MyKitapList
            </Typography>
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>Profile Git</MenuItem>
              <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Ana Sayfa
          </Typography>
          <Button variant="contained" color="primary" style={{ marginBottom: '20px' }} onClick={handleAddBook}>
            Kitap Ekle
          </Button>
          <Button variant="contained" color="secondary" style={{ marginBottom: '20px', marginLeft: '10px' }} onClick={handleChangeBookStatus}>
            Kitaplarımı Değiştir
          </Button>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            Bu hafta okuduğun kitaplar:
          </Typography>
          <Grid container spacing={4} style={{ marginBottom: '20px' }}>
            {weeklyBooks.length > 0 ? (
              weeklyBooks.slice(0, 6).map((book, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={book?.cover_url || 'https://via.placeholder.com/150'}
                      alt={book?.title}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {book?.title || 'Kitap Bilgisi Yok'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Yazar: {book?.author || 'Bilinmeyen Yazar'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography align="center" style={{ width: '100%' }}>
                Henüz bu hafta okuduğun kitap yok.
              </Typography>
            )}
          </Grid>
          <Button
            variant="contained"
            color="secondary"
            style={{ float: 'right', marginBottom: '20px' }}
            onClick={() => navigate('/all-books')}
          >
            Daha Fazla Göster
          </Button>
        </Container>
      </Grid>
    </Grid>
  );
};

export default HomePage;
