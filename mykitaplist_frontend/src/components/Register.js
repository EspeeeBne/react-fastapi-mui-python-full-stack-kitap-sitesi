import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { TextField, Button, Typography, Container } from '@mui/material';

const api = axios.create({
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await api.post('/register', {
        username,
        password,
      });
      alert(response.data.message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Kayıt başarısız: Bilinmeyen bir hata oluştu';
      alert(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Kayıt Ol</Typography>
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
        onClick={handleRegister}
        style={{ marginTop: '20px' }}
      >
        Kayıt Ol
      </Button>
      <Typography variant="body2" align="center" style={{ marginTop: '20px' }}>
        Hesabın var mı? <Link to="/login">Giriş yapsana!</Link>
      </Typography>
    </Container>
  );
};

export default Register;
