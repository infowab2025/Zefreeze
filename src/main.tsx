import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

// Disable all error popups
window.addEventListener('error', (e) => {
  e.preventDefault();
  return false;
});

// Disable React error overlay
window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
  return false;
});

// Configure toast to not show any error notifications
const toasterConfig = {
  error: {
    duration: 0, // Don't show error toasts
  },
  loading: {
    duration: 0, // Don't show loading toasts
  },
  success: {
    duration: 2000, // Keep success notifications
  }
};

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Toaster position="top-center" toastOptions={toasterConfig} />
  </>
);