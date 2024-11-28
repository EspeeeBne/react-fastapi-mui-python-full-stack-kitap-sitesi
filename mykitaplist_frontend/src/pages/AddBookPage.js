import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Grid, AppBar, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../api';

const AddBookPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const navigate = useNavigate();

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
    navigate('/login');
  };

  const handleAddBook = async () => {
    if (!title) {
      alert("Kitap adı zorunludur. Kapak URL'si isteğe bağlıdır.");
      return;
    }

    try {
      const response = await api.get(`/search_book?query=${title}`);
      const books = response.data.books;

      if (books && books.length > 0) {
        const book = books[0];
        setTitle(book.title);
        setAuthor(book.author);
        setCoverUrl(book.cover_url || 'https://via.placeholder.com/150');
        alert('Kitap bulundu, bilgileri kontrol edin ve eklemek için tekrar onaylayın.');
      } else {
        alert('Bu kitap arşivde bulunamadı, bilgileri manuel olarak doldurun.');
      }
    } catch (error) {
      alert('Kitap araması yapılamadı: ' + (error.response?.data?.detail || 'Bilinmeyen bir hata oluştu'));
    }
  };

  const confirmAddBook = async () => {
    if (!title || !author) {
      alert("Kitap adı ve yazar bilgileri zorunludur. Kapak URL'si isteğe bağlıdır.");
      return;
    }

    try {
      await api.post('/add_book', {
        id: '',
        title,
        author,
        cover_url: coverUrl || 'https://via.placeholder.com/150',
      });
      alert('Kitap başarıyla eklendi!');
      navigate('/all-books');
    } catch (error) {
      alert(`Kitap eklenemedi: ${error.response?.data?.detail || error.response?.data || 'Bilinmeyen bir hata oluştu'}`);
    }
  };

  const handleAddRandomBook = async () => {
    try {
      const response = await api.get('/recommend_book');
      const randomBook = response.data;

      await api.post('/add_book', {
        id: randomBook.id,
        title: randomBook.title,
        author: randomBook.author,
        cover_url: randomBook.cover_url || 'https://via.placeholder.com/150',
      });
      alert('Rastgele kitap başarıyla eklendi!');
      navigate('/all-books');
    } catch (error) {
      alert(`Rastgele kitap eklenemedi: ${error.response?.data?.detail || error.response?.data || 'Bilinmeyen bir hata oluştu'}`);
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
            Kitap Ekle
          </Typography>
          <Grid container spacing={3} style={{ marginTop: '20px' }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Kitap Adı"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Yazar"
                variant="outlined"
                fullWidth
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Kapak URL'si"
                variant="outlined"
                fullWidth
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddBook}
                style={{ marginTop: '20px' }}
              >
                Kitap Ara
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={confirmAddBook}
                style={{ marginTop: '20px' }}
              >
                Kitap Ekle
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="default"
                fullWidth
                onClick={handleAddRandomBook}
                style={{ marginTop: '20px' }}
              >
                Rastgele Kitap Ekle
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Grid>
    </Grid>
  );
};

export default AddBookPage;
