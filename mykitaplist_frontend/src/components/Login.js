import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { TextField, Button, Typography, Container } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', {
        username,
        password,
      });
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('token', response.data.token);
      alert('Giriş başarılı');
      navigate('/');
    } catch (error) {
      alert('Giriş başarısız: ' + (error.response?.data?.detail || 'Bilinmeyen bir hata oluştu'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Giriş Yap</Typography>
      <TextField
        label="Kullanıcı Adı"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Şifre"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
        style={{ marginTop: '20px' }}
      >
        Giriş Yap
      </Button>
      <Typography variant="body2" align="center" style={{ marginTop: '20px' }}>
        Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
      </Typography>
    </Container>
  );
};

export default Login;
