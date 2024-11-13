import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);