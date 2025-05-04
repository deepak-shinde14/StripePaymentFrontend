// Create ./client/src/UserManagement.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, Switch, MenuItem, Select } from '@mui/material';
import axios from 'axios';
import './App.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('https://stripepaymentbackend-7zq9.onrender.com/api/v1/users', {
        withCredentials: true
      });
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage('Failed to fetch users. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await axios.put(
        `https://stripepaymentbackend-7zq9.onrender.com/api/v1/users/${userId}/status`,
        { isActive },
        { withCredentials: true }
      );
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
      setMessage('User status updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user status:', err);
      setMessage('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(
        `https://stripepaymentbackend-7zq9.onrender.com/api/v1/users/${userId}/role`,
        { role },
        { withCredentials: true }
      );
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role } : user
      ));
      setMessage('User role updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      setMessage('Failed to update user role');
    }
  };

  return (
    <div className="card">
      <Typography variant="h4" component="h1" className="card-title">
        User Management
      </Typography>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <Typography variant="body1" style={{ textAlign: 'center', padding: '2rem' }}>
          No users found
        </Typography>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                      )}
                      {user.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      size="small"
                      disabled={user.role === 'superadmin'} // Prevent changing superadmin role
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superadmin">Super Admin</MenuItem>
                    </Select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        checked={user.isActive}
                        onChange={(e) => handleStatusChange(user._id, e.target.checked)}
                        color="primary"
                        disabled={user.role === 'superadmin'} // Prevent deactivating superadmin
                      />
                      <span className={`status-badge ${user.isActive ? 'status-success' : 'status-failed'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleStatusChange(user._id, !user.isActive)}
                      disabled={user.role === 'superadmin'}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;