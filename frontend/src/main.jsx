import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { apiClient } from './lib/apiClient';
import './styles.css';

// Wake the (possibly sleeping) backend as early as possible — on free hosting
// the first request after idle takes ~30-60s, so kicking it off the moment the
// page loads means the server is usually awake by the time the user signs in.
apiClient.get('/health').catch(() => {});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
