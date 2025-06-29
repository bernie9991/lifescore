import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import App from './App.tsx';
import './index.css';
import { initializeRevenueCat } from './lib/revenuecat';

// Initialize RevenueCat
initializeRevenueCat();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);