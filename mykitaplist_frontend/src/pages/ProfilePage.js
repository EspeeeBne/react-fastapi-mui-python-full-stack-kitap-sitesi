import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Box, AppBar, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Card, CardContent, CardMedia, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from '../api';

const ProfilePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profile, setProfile] = useState({});
  const [comment, setComment] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
  
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${username}`);
        setProfile(response.data);
        setProfilePictureUrl(response.data.profile_picture_url);
      } catch (error) {
        console.error('Profil bilgileri alınırken bir hata oluştu:', error);
      }
    };
    fetchProfile();
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

  const handleUpdateProfilePicture = async () => {
    try {
      await api.put(`/update_profile_picture/${localStorage.getItem('username')}`, {
        profile_picture_url: profilePictureUrl,
      });      
      alert('Profil resmi başarıyla güncellendi!');
    } catch (error) {
      alert('Profil resmi güncellenemedi: ' + JSON.stringify(error.response?.data?.detail || 'Bilinmeyen bir hata oluştu'));
    }
  };

  const handleAddComment = async () => {
    if (!comment) {
      alert('Yorum boş olamaz.');
      return;
    }
    try {
      const username = localStorage.getItem('username');
      const response = await api.get(`/profile/${username}`);
      const commenterUsername = response.data.username;
      const commenterProfilePicture = response.data.profile_picture_url || 'https://via.placeholder.com/150';
      await api.put(`/add_comment/${username}`, {
        comment: comment,
      });
      alert('Yorum başarıyla eklendi!');
      setProfile((prevProfile) => ({
        ...prevProfile,
        comments: [
          ...prevProfile.comments,
          {
            commenter_username: commenterUsername,
            commenter_profile_picture: commenterProfilePicture,
            comment: comment,
          },
        ],
      }));
      setComment('');
    } catch (error) {
      alert('Yorum eklenemedi: ' + (error.response?.data?.detail || 'Bilinmeyen bir hata oluştu'));
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
          <Grid container spacing={4} style={{ marginTop: '20px' }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={profilePictureUrl || 'https://via.placeholder.com/150'}
                  alt="Profil Resmi"
                />
                <CardContent>
                  <TextField
                    label="Profil Resmi URL'si"
                    variant="outlined"
                    fullWidth
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    style={{ marginBottom: '10px' }}
                  />
                  <Button variant="contained" color="primary" fullWidth onClick={handleUpdateProfilePicture}>
                    Profil Resmini Güncelle
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {profile.username} Profil Bilgileri
              </Typography>
              <Typography variant="h6">Tamamlanan Kitaplar: {profile.completed_books?.length || 0}</Typography>
              <Typography variant="h6">Okunacak Kitaplar: {profile.to_read_books?.length || 0}</Typography>
              <Typography variant="h6">Okunan Kitaplar: {profile.currently_reading?.length || 0}</Typography>
              <Box style={{ marginTop: '20px' }}>
                <Typography variant="h5" gutterBottom>
                  Arkadaşlarım
                </Typography>
                <Grid container spacing={2}>
                  {profile.friends && profile.friends.length > 0 ? (
                    profile.friends.map((friend, index) => (
                      <Grid item key={index} xs={6} sm={4} md={3}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="150"
                            image={friend.profile_picture_url || 'https://via.placeholder.com/150'}
                            alt={friend.username}
                          />
                          <CardContent>
                            <Typography variant="body1">{friend.username}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Typography>Henüz arkadaş eklenmemiş.</Typography>
                  )}
                </Grid>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{ float: 'right', marginTop: '20px' }}
                  onClick={() => navigate('/friends')}
                >
                  Bütün Arkadaşlarımı Gör
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box style={{ marginTop: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Profile Yorum Yap
            </Typography>
            <TextField
              label="Yorum"
              variant="outlined"
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <Button variant="contained" color="primary" onClick={handleAddComment}>
              Yorum Ekle
            </Button>
          </Box>
          <Box style={{ marginTop: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Yorumlar
            </Typography>
            {profile.comments && profile.comments.length > 0 ? (
              profile.comments.map((comment, index) => (
                <Card key={index} style={{ marginBottom: '10px' }}>
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs={2}>
                        <CardMedia
                          component="img"
                          height="50"
                          image={comment.commenter_profile_picture || 'https://via.placeholder.com/150'}
                          alt={comment.commenter_username}
                        />
                      </Grid>
                      <Grid item xs={10}>
                        <Typography variant="body1">{comment.comment}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Yorum Yapan: {comment.commenter_username}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography>Henüz yorum yapılmamış.</Typography>
            )}
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};

export default ProfilePage;
