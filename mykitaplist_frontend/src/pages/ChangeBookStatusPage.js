import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Grid, AppBar, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Card, CardContent } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../api';

const ChangeBookStatusPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');

    if (!username) {
      navigate('/login');
      return;
    }

    const fetchUserBooks = async () => {
      try {
        const response = await api.get('/books');
        setUserBooks(response.data.books);
      } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
      }
    };
    fetchUserBooks();
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

  const handleStatusChange = async (bookId, status) => {
    const username = localStorage.getItem('username');
    try {
      await api.put(`/user_reading_status/${username}`, { book_id: bookId, status });
      alert('Kitap durumu başarıyla güncellendi.');
    } catch (error) {
      console.error('Kitap durumu güncellenirken bir hata oluştu:', error);
    }
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
              MyKitapList - Kitap Durumu Değiştir
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
          <Typography variant="h4" align="center" gutterBottom>
            Kitaplarımı Değiştir
          </Typography>
          <Grid container spacing={4} style={{ marginBottom: '20px' }}>
            {userBooks.length > 0 ? (
              userBooks.map((book, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Card>
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
                        onClick={() => handleStatusChange(book.id, 'to_read')}
                      >
                        Okunacaklara Ekle
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        style={{ marginTop: '10px', marginLeft: '10px' }}
                        onClick={() => handleStatusChange(book.id, 'reading')}
                      >
                        Okuyorum Olarak İşaretle
                      </Button>
                      <Button
                        variant="contained"
                        style={{ marginTop: '10px', marginLeft: '10px' }}
                        onClick={() => handleStatusChange(book.id, 'completed')}
                      >
                        Okudum Olarak İşaretle
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography align="center" style={{ width: '100%' }}>
                Henüz eklediğiniz kitap yok.
              </Typography>
            )}
          </Grid>
        </Container>
      </Grid>
    </Grid>
  );
};

export default ChangeBookStatusPage;
