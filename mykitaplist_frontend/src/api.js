import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.detail || 'Bir hata oluştu.';
    alert(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
