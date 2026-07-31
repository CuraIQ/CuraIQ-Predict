import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { PredictIQQueryProvider } from './providers/QueryProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PredictIQQueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PredictIQQueryProvider>
  </React.StrictMode>,
);
