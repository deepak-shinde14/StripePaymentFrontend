import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Typography, TextField } from '@mui/material';
import axios from 'axios';
import './App.css';

const PaymentForm = ({ user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(1000); // $10.00
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      const { data: { clientSecret } } = await axios.post(
        'https://stripepaymentbackend-7zq9.onrender.com/api/v1/create-payment-intent',
        { amount, description: description || 'Payment' },
        { withCredentials: true }
      );

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email
          }
        }
      });

      if (error) {
        setMessage(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded! Check your transaction history.');
        setDescription('');
        setAmount(1000);
      }
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '1800px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" className="card-title">
        Make a Payment
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Amount (in cents)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            min="100"
            step="100"
            required
          />
          <small>${(amount / 100).toFixed(2)}</small>
        </div>

        <div className="form-group">
          <label className="form-label">Card Details</label>
          <div className="StripeElement">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this payment for?"
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!stripe || loading}
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('failed') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PaymentForm;