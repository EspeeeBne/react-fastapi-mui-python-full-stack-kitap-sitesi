import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import ProfilePage from './pages/ProfilePage';
import AddBookPage from './pages/AddBookPage';
import AllBooksPage from './pages/AllBooksPage';
import FindFriendPage from './pages/FindFriendPage';
import FriendPage from './pages/FriendPage';
import ChangeBookStatusPage from './pages/ChangeBookStatusPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/all-books" element={<AllBooksPage />} />
        <Route path="/find-friend" element={<FindFriendPage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/change-status" element={<ChangeBookStatusPage />} />
      </Routes>
      <div className="created-by">Created by EspeeeBne</div>
    </Router>
  );
}

export default App;
