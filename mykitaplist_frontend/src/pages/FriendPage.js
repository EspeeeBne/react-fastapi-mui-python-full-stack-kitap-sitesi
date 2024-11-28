import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Grid, Card, CardContent } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const FriendPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          navigate('/login');
          return;
        }
        const response = await api.get(`/profile/${username}`);
        const currentUser = response.data;
        if (currentUser && currentUser.friends.length > 0) {
          const friendList = currentUser.friends.map((friend) => ({
            id: friend.id,
            username: friend.username,
            profile_picture_url: friend.profile_picture_url,
          }));
          setFriends(friendList);
        }
      } catch (error) {
        console.error('Arkadaşlar alınırken bir hata oluştu:', error);
      }
    };
    fetchFriends();
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
    navigate('/login');
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
      <Grid item xs={10} style={{ padding: '20px' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              MyKitapList - Arkadaşlarım
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
        <Typography variant="h3" align="center" gutterBottom>
          Arkadaş Listesi
        </Typography>
        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <Grid item xs={12} md={4} key={friend.id}>
                <Card>
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs={3}>
                        <img src={friend.profile_picture_url || 'https://via.placeholder.com/150'} alt={friend.username} style={{ width: '100%', borderRadius: '50%' }} />
                      </Grid>
                      <Grid item xs={9} style={{ paddingLeft: '10px' }}>
                        <Typography variant="h6">
                          {friend.username}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography align="center" style={{ width: '100%', marginTop: '20px' }}>
              Henüz arkadaş eklenmemiş.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FriendPage;
