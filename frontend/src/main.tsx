import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1d1d1f',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
