import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ping the backend to wake it up (e.g. from Render free tier sleep)
// We use fetch instead of api.get to avoid triggering the 401 interceptor and logging out
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
fetch(API_BASE_URL).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
