import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import axios from 'axios';
import './App.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get('https://stripepaymentbackend-7zq9.onrender.com/api/v1/transactions', {
          withCredentials: true
        });
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refresh]);

  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'succeeded':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-failed';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Typography variant="h4" component="h1" className="card-title">
          Transaction History
        </Typography>
        <button
          onClick={() => setRefresh(!refresh)}
          className="submit-btn"
          style={{ width: 'auto', padding: '0.5rem 1rem' }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : transactions.length === 0 ? (
        <Typography variant="body1" style={{ textAlign: 'center', padding: '2rem' }}>
          No transactions found
        </Typography>
      ) : (
        <ul className="transaction-list">
          {transactions.map((txn) => (
            <li key={txn.id} className="transaction-item">
              <div className="transaction-info">
                <Typography variant="body1" style={{ fontWeight: '500' }}>
                  {txn.description || 'Payment'}
                </Typography>
                <Typography variant="body2" className="transaction-date">
                  {formatDate(txn.date)}
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Typography variant="body1" className="transaction-amount">
                  {formatAmount(txn.amount)}
                </Typography>
                <span className={`status-badge ${getStatusClass(txn.status)}`}>
                  {txn.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;