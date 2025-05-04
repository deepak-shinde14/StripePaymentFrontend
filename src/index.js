import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!stripePublicKey || !googleClientId) {
  throw new Error('Missing Stripe or Google Client ID in environment variables.');
}

const stripePromise = loadStripe(stripePublicKey);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
