import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { syncBrandingFromServer } from './store';

// Sync branding from Supabase settings on startup (non-blocking)
syncBrandingFromServer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
