import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Button, Typography, Container } from '@mui/material';
import PaymentForm from './PaymentForm';
import TransactionHistory from './TransactionHistory';
import './App.css';
import UserManagement from './UserManagement';

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('https://stripepaymentbackend-7zq9.onrender.com/api/v1/current_user', {
        withCredentials: true,
      });
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      await axios.post(
        'https://stripepaymentbackend-7zq9.onrender.com/auth/google',
        { token: credential },
        { withCredentials: true }
      );
      await fetchUser();
      navigate('/');
      setMessage('Login successful!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Google login error:', err);
      setMessage('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('https://stripepaymentbackend-7zq9.onrender.com/api/v1/logout', { withCredentials: true });
      setUser(null);
      navigate('/');
      setMessage('Logged out successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Logout error:', err);
      setMessage('Logout failed. Please try again.');
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
          Payment App
        </Typography>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          {user && (
            <>
              <Link to="/pay" className="nav-link">Make Payment</Link>
              <Link to="/transactions" className="nav-link">Transactions</Link>
              {user.role === 'superadmin' && (
                <Link to="/users" className="nav-link">User Management</Link>
              )}
              <Button
                onClick={handleLogout}
                className="logout-btn"
                sx={{ textTransform: 'none' }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className="container">
        {message && (
          <div className={`message ${message.includes('failed') ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <div className="dashboard">
                  <div className="welcome-card">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="user-avatar"
                      />
                    )}
                    <Typography variant="h4" component="h1" gutterBottom>
                      Welcome back, {user.name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      You're ready to make secure payments.
                    </Typography>
                  </div>
                </div>
              ) : (
                <div className="auth-container">
                  <div className="auth-card">
                    <Typography variant="h4" component="h1" className="auth-title">
                      Welcome to Payment App
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Sign in with Google to continue
                    </Typography>
                    <div style={{ margin: '1.5rem 0' }}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          console.error('Google Login Failed');
                          setMessage('Google login failed. Please try again.');
                        }}
                        theme="filled_blue"
                        size="large"
                        shape="pill"
                        text="signin_with"
                      />
                    </div>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/pay"
            element={user ? <PaymentForm user={user} /> : <div className="auth-container"><Typography>Please login first</Typography></div>}
          />
          <Route
            path="/transactions"
            element={user ? <TransactionHistory /> : <div className="auth-container"><Typography>Please login first</Typography></div>}
          />
          <Route
            path="/users"
            element={user?.role === 'superadmin' ? <UserManagement /> : <div className="auth-container"><Typography>Access Denied</Typography></div>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;